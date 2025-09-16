const Scenario = require('../models/Scenario');
const Messages = require('../models/Message');

const { GoogleGenAI } = require('@google/genai');

const aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

let clients = {};

function systemInstructionBuilder(interview) {
    return (
        `
            You are an AI Interviewer. Your job: simulate a realistic interview for a given job scenario using only the candidate's resume text and the candidate's chat replies. Follow these rules strictly. Job title, job description, and candidate's resume text are provided at the end of system instruction

            A. Interview flow & behaviour
            1. Follow this structured sequence unless the user asked for a different flow:
            - Greeting & short intro
            - Ask the candidate to give a short self-introduction (if not already provided)
            - Background & experience questions
            - Technical / role-specific questions (tailored to the scenario)
            - Behavioral questions
            - Motivation & role-fit questions
            - Invite candidate questions
            - Wrap-up
            - Tell user to click on the stop interview button below to stop the interview.
            2. Ask **one question at a time**, wait for the candidate answer, and adapt follow-ups based on the candidate's responses and the resume content.
            3. Use the resume text to:
            - Prioritize asking about relevant experience or claimed skills.
            - Point out potential gaps or ask for clarifying details if something ambiguous is in the resume.
            4. Do **not** provide evaluative feedback during the interview. Do not give final scores until instructed to end the interview by a backend control message (see section E).
            5. Keep tone professional and supportive (real interviewer tone). Be natural and realistic.
            6. Always respond ONLY in ${interview.language}, no other language, except for technical words.
            7. When the user says first "{8c09f39da56f655f90be2f9d33680166d2ab803d}", the interview is started. Do the structured sequence immediately as A.1 states. **Introduce yourself with a realistic interviewer name (e.g., “My name is Sarah from the engineering team”), never mention being AI or neutral.**
            8. Never include meta-comments, brackets, or explanations like “[Interviewer Name - ...]”. Always act fully in-character as a human interviewer.

            B. When to stop
            - When user starts the message with "{12c14e93d11e79dc92dc8446e4186b16094bc6aa}", the interview has ended. At that point, stop interviewer roleplay and wait for the next user instruction.

            Job Title: "${interview.title}"
            Job Description:
            """
            ${interview.description}
            """
            Resume:
            """
            ${interview.resume}
            """
            `
    )
}

async function callAIWithRetry(userText, interview, chatHistory = [], retries = 3) {
    const model = 'gemini-2.5-flash';
    const config = {
        thinkingConfig: { thinkingBudget: -1 }, systemInstruction: systemInstructionBuilder(interview)
    };

    const contents = [];

    chatHistory.forEach(msg => {
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
    const userId = req.headers.cookie?.split('user_id=')[1];
    const interview = req.params.interview;
    if (!interview) return res.status(400).json({ error: 'interview required' });

    const key = `${userId}-${interview}`;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write('\n');

    if (!clients[key]) clients[key] = [];
    clients[key].push(res);

    req.on('close', () => {
        clients[key] = clients[key].filter(c => c !== res);
    });
};

exports.sendMessage = async (req, res) => {
    const { interview_id, text } = req.body;
    const user_id = req.headers.cookie?.split('user_id=')[1];
    const key = `${user_id}-${interview_id}`;

    if (!interview_id || !text) return res.status(400).json({ error: 'Missing fields' });

    await Messages.findOneAndUpdate(
        { interview_id },
        { $push: { messages: { role: 'user', text } } },
        { upsert: true, new: true }
    );

    const interview = req.user.interviews.id(interview_id);
    const chat = await Messages.findOne({ interview_id });
    const chatHistory = chat ? chat.messages.slice(0, -1) : [];

    try {
        const model = 'gemini-2.5-flash';
        const config = {
            thinkingConfig: { thinkingBudget: -1 },
            systemInstruction: systemInstructionBuilder(interview)
        };

        const contents = [
            ...chatHistory.map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            })),
            { role: 'user', parts: [{ text }] }
        ];

        res.status(200).json({ message: "OK" });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AI response timeout')), 30000);
        });

        try {
            const response = await Promise.race([
                aiClient.models.generateContentStream({ model, config, contents }),
                timeoutPromise
            ]);

            let fullText = '';

            for await (const chunk of response) {
                if (chunk.text) {
                    fullText += chunk.text;

                    if (clients[key]) {
                        const msg = `data: ${JSON.stringify({
                            role: 'ai',
                            text: chunk.text,
                            isFinal: false
                        })}\n\n`;
                        clients[key].forEach(clientRes => {
                            try {
                                clientRes.write(msg);
                            } catch (err) {
                                console.error('Error writing to client:', err);
                            }
                        });
                    }
                }
            }

            if (clients[key]) {
                const msg = `data: ${JSON.stringify({
                    role: 'ai',
                    text: '', 
                    isFinal: true,
                    fullText: fullText
                })}\n\n`;
                clients[key].forEach(clientRes => {
                    try {
                        clientRes.write(msg);
                    } catch (err) {
                        console.error('Error writing to client:', err);
                    }
                });
            }

            await Messages.findOneAndUpdate(
                { interview_id },
                { $push: { messages: { role: 'ai', text: fullText } } },
                { upsert: true, new: true }
            );
        } catch (streamError) {
            throw streamError;
        }

    } catch (err) {
        if (clients[key]) {
            const errorMsg = `data: ${JSON.stringify({
                role: 'error',
                text: 'Sorry, there was an error processing your message.',
                isFinal: true
            })}\n\n`;
            clients[key].forEach(clientRes => {
                try {
                    clientRes.write(errorMsg);
                } catch (writeErr) {
                    console.error('Error writing error message:', writeErr);
                }
            });
        }
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

        res.status(200).json(interview);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getInterviewMessage = async (req, res) => {
    try {
        const interview = req.user.interviews.id(req.params.id);
        if (!interview) {
            return res.status(404).json({ messages: [] });
        }

        const chat = await Messages.find({ interview_id: interview._id });

        if (!chat || chat.length === 0) return res.status(200).json({ messages: [] });

        res.status(200).json({ messages: chat[0].messages || [] });
    } catch (err) {
        res.status(500).json({ messages: [] });
    }
};

exports.getInterviewAll = async (req, res) => {
    try {
        const interview = [...req.user.interviews].reverse();
        res.status(200).json(interview);
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
        {12c14e93d11e79dc92dc8446e4186b16094bc6aa}
        
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
