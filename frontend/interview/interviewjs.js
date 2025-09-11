// --- Application State ---
    const state = {
        view: 'interview',
        interviewId: null, // New: to store the current interview session ID
        scenarioId: 3, // Hardcoded for this example
        resumeContent: 'Simulated resume content.',
        chatHistory: [],
    };

    // --- DOM Elements ---
    const loadingEl = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    const views = {
        interview: document.getElementById('view-interview'),
        feedback: document.getElementById('view-feedback')
    };
    const chatBox = document.getElementById('chatBox');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const endInterviewBtn = document.getElementById('endInterviewBtn');
    const feedbackContent = document.getElementById('feedbackContent');
    const newInterviewBtn = document.getElementById('newInterviewBtn');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    
    // --- Configuration ---
    const API_BASE_URL = 'https://api.example.com/v1'; //  Replace with your actual backend URL

    // --- Utility Functions ---
    function setView(viewName) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        if (views[viewName]) {
            views[viewName].classList.remove('hidden');
            state.view = viewName;
            if (viewName === 'interview') {
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    }

    function showLoading(show) {
        if (show) {
            loadingEl.style.display = 'flex';
            contentEl.style.display = 'none';
        } else {
            loadingEl.style.display = 'none';
            contentEl.style.display = 'flex';
        }
    }

    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('hidden');
    }

    async function addMessageToChat(sender, text) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message-bubble', sender === 'ai' ? 'ai-bubble' : 'user-bubble');
        messageEl.textContent = text;
        chatBox.appendChild(messageEl);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // The project API does not require client-side chat history,
        // so we're just adding to the DOM.
    }

    // --- API Interaction Functions ---
    // This is a placeholder for a real login function.
    // The project document specifies a login endpoint at POST /v1/auth/login.
    async function login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // [cite: 30]
                body: JSON.stringify({ username, password }) // [cite: 21]
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            // The browser will automatically store the session cookie [cite: 25]
            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Login failed:', error);
            showModal('Login Failed', 'Unable to log in. Please try again.');
        }
    }

    async function startInterview() {
        showLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/interviews/start`, { // 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // [cite: 231]
                body: JSON.stringify({
                    scenario_id: state.scenarioId, // [cite: 176]
                    resume_text: state.resumeContent // [cite: 177]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            const interview = await response.json(); // 
            state.interviewId = interview.id;
            
            // The first AI message should come from the server after the interview starts.
            // For now, we'll simulate the first AI question. A more robust implementation
            // would have the server return the first message.
            addMessageToChat('ai', "Hello, thanks for coming in. Can you tell me a little bit about yourself?");
            
        } catch (error) {
            console.error("Failed to start interview:", error);
            showModal('Error', 'Failed to start the interview. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    async function sendMessageAndGetReply(userMessage) {
        showLoading(true);
        addMessageToChat('user', userMessage);
        
        try {
            const response = await fetch(`${API_BASE_URL}/interviews/${state.interviewId}/messages`, { // 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ text: userMessage }) // 
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json(); // [cite: 190]
            if (data.ai_message) {
                addMessageToChat('ai', data.ai_message.text); // [cite: 192]
            }
            
        } catch (error) {
            console.error("Failed to send message:", error);
            showModal('Error', 'Failed to send message. Please try again.');
        } finally {
            showLoading(false);
        }
    }
    
    async function getInterviewFeedback() {
        showLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/interviews/${state.interviewId}/finish`, { // 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({}) // Optional body can be empty
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json(); // [cite: 213]
            const result = data.result;
            
            // Format feedback for display
            const formattedFeedback = `
                <h3 class="font-bold text-xl mb-2">Overall Score: ${result.score} / 100</h3>
                <h4 class="font-semibold mt-4 mb-2">Detailed Feedback:</h4>
                <p><strong>Communication:</strong> ${result.criteria.communication}</p>
                <p><strong>Technical:</strong> ${result.criteria.technical}</p>
                <p><strong>Confidence:</strong> ${result.criteria.confidence}</p>
                <h4 class="font-semibold mt-4 mb-2">Resume Suggestions:</h4>
                <p>${result.resume_suggestions}</p>
                <h4 class="font-semibold mt-4 mb-2">Interview Suggestions:</h4>
                <p>${result.interview_suggestions}</p>
            `;
            feedbackContent.innerHTML = formattedFeedback; // [cite: 217, 218]

            setView('feedback');
        } catch (error) {
            console.error("Failed to get feedback:", error);
            showModal('Error', 'Failed to get feedback. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    // --- UI Event Handlers ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            await sendMessageAndGetReply(userMessage);
            chatInput.value = '';
        }
    });

    endInterviewBtn.addEventListener('click', async () => {
        if (!state.interviewId) {
            showModal('Error', 'No interview session is active.');
            return;
        }
        // A check on the number of messages would be done on the server, but
        // it's good practice to add a client-side check as well
        if (chatBox.children.length < 2) {
            showModal('No Conversation', 'Please have a short conversation with the interviewer before ending the session.');
            return;
        }

        await getInterviewFeedback();
    });

    newInterviewBtn.addEventListener('click', () => {
        resetApp();
    });
    
    modalCloseBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // --- App Lifecycle Functions ---
    function resetApp() {
        state.interviewId = null;
        chatBox.innerHTML = '';
        feedbackContent.innerHTML = '';
        setView('interview');
        startInterview();
    }
    
    // Initialize the app on page load
    window.onload = () => {
        resetApp();
    };