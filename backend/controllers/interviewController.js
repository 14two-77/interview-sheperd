const Scenario = require('../models/Scenario');
const Messages = require('../models/Message');

const { GoogleGenAI } = require('@google/genai');

const aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

let clients = {};
const interviewLocks = new Map();

async function callAIWithRetry(userText, interview, chatHistory = [], retries = 3) {
    const model = 'gemini-2.5-flash';
    const config = { thinkingConfig: { thinkingBudget: -1 } };

    const contents = [];

    contents.push({
        role: 'user',
        parts: [{
            text: `
                You are an interview coach.
                **Always respond ONLY in ${interview.language}, no other language.**
                Do NOT translate your responses.
                Topic: ${interview.title}
                Description: ${interview.description}

                User Resume:
                ${interview.resume}

                Answer clearly, following the topic and user's resume, in ${interview.language}.
            `
        }]
    });

    chatHistory.slice(-10).forEach(msg => {
        contents.push({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        });
    });

    contents.push({ role: 'user', parts: [{ text: userText }] });

    for (let i = 0; i < retries; i++) {
        try {
            let fullText = '';
            const response = await aiClient.models.generateContentStream({ model, config, contents });
            for await (const chunk of response) fullText += chunk.text;
            return fullText;
        } catch (err) {
            if (err.status === 503 && i < retries - 1) {
                console.warn(`Retry ${i + 1} due to model overload...`);
                await new Promise(r => setTimeout(r, 500 * (i + 1)));
            } else {
                throw err;
            }
        }
    }
}

exports.streamInterview = (req, res) => {
    const userId = req.user._id.toString();
    const interview = req.params.interview;

    if (!interview) return res.status(400).json({ error: 'interview required' });

    const key = `${userId}-${interview}`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!clients[key]) clients[key] = [];
    clients[key].push(res);

    req.on('close', () => {
        clients[key] = clients[key].filter(c => c !== res);
    });
};

exports.sendMessage = async (req, res) => {
    const { interview_id, text } = req.body;
    const user_id = req.user._id;

    if (!interview_id || !text) return res.status(400).json({ error: 'Missing fields' });

    const userMessage = await Messages.findOneAndUpdate(
        { interview_id },
        { $push: { messages: { role: 'user', text } } },
        { upsert: true, new: true }
    );
    const lastMessageIndex = userMessage.messages.length - 1;
    const lastMessageId = userMessage.messages[lastMessageIndex]._id;

    const interview = req.user.interviews.id(interview_id);
    const chat = await Messages.findOne({ interview_id });
    const chatHistory = chat ? chat.messages.slice(0, -1) : [];

    while (interviewLocks.get(interview_id)) {
        await new Promise(r => setTimeout(r, 200));
    }
    interviewLocks.set(interview_id, true);

    try {
        const aiReply = await callAIWithRetry(text, interview, chatHistory);

        await Messages.findOneAndUpdate(
            { interview_id },
            { $push: { messages: { role: 'ai', text: aiReply } } },
            { upsert: true, new: true }
        );

        const key = `${user_id}-${interview_id}`;
        if (clients[key]) {
            const msg = `data: ${JSON.stringify({ message: 'AI Response Text', Result: aiReply })}\n\n`;
            clients[key].forEach(res => res.write(msg));
        }

        res.status(200).json({ message: "OK" });
    } catch (error) {
        await Messages.updateOne(
            { interview_id },
            { $pull: { messages: { _id: lastMessageId } } }
        );
        res.status(503).json({ error: 'AI server overloaded. User message removed.' });
    } finally {
        interviewLocks.delete(interview_id);
    }
};

exports.startInterview = async (req, res) => {
    try {
        const { scenario_id, resume_text } = req.body;
        const scenario = await Scenario.findById(scenario_id);

        if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

        req.user.interviews.push({
            title: scenario.title,
            description: scenario.description,
            language: scenario.language,
            resume: resume_text
        });

        const newInterview = req.user.interviews[req.user.interviews.length - 1];
        await req.user.save();

        res.status(200).json({
            message: 'OK',
            interview_id: newInterview._id
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getInterview = async (req, res) => {
    try {
        const interview = req.user.interviews.id(req.params.id);
        if (!interview) return res.status(404).json({ error: 'Not found' });

        const chat = await Messages.findOne({ interview_id: interview._id });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.finishInterview = async (req, res) => {
    const interview = req.user.interviews.id(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Not found' });

    const chat = await Messages.findOne({ interview_id: interview._id });
    const chatHistory = chat ? chat.messages : [];

    const prompt = `
        You are an interview evaluator.
        Evaluate the user's answers in the following conversation for the topic: ${interview.title}.
        Use the user's resume for context:
        ${interview.resume}

        Score ONLY the following categories (each out of 10):
        1. Communication & Clarity — 15%
        2. Relevance of Experience — 20%
        3. Technical / Domain Knowledge — 25%
        4. Problem-Solving & Reasoning — 15%
        5. Motivation & Role Fit — 10%
        6. Professionalism & Soft Skills — 10%
        7. Resume Quality — 5%

        Provide a short suggestion at the end.

        Do NOT create JSON, DO NOT change category names. 
        Output text only in this format:
        Communication & Clarity: <score>
        Relevance of Experience: <score>
        Technical / Domain Knowledge: <score>
        Problem-Solving & Reasoning: <score>
        Motivation & Role Fit: <score>
        Professionalism & Soft Skills: <score>
        Resume Quality: <score>
        Suggestion: <text>
    `;

    const chatText = chatHistory.map(msg => `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.text}`).join('\n');

    try {
        const aiResult = await callAIWithRetry(`${prompt}\nConversation:\n${chatText}`, interview, []);

        interview.results = {
            scores: [
                { title: 'Communication & Clarity', score: null },
                { title: 'Relevance of Experience', score: null },
                { title: 'Technical / Domain Knowledge', score: null },
                { title: 'Problem-Solving & Reasoning', score: null },
                { title: 'Motivation & Role Fit', score: null },
                { title: 'Professionalism & Soft Skills', score: null },
                { title: 'Resume Quality', score: null }
            ],
            suggestions: ''
        };

        aiResult.split('\n').forEach(line => {
            const [key, ...rest] = line.split(':');
            if (!key) return;
            const value = rest.join(':').trim();
            const scoreEntry = interview.results.scores.find(s => s.title === key);
            if (scoreEntry) scoreEntry.score = Number(value) || 0;
            else if (key.toLowerCase().includes('suggestion')) interview.results.suggestions = value;
        });

        await req.user.save();
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
};
