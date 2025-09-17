const interview_id = sessionStorage.getItem('interview');
const page = sessionStorage.getItem('page');

const endBtn = document.getElementById('endInterviewBtn');
const chatArea = document.getElementById('chatArea');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const sendBtn = chatForm.querySelector('button[type="submit"]');

let isAIResponding = false;
let eventSource = null;

function closeEventSource() {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
}

function createEventSource() {
    closeEventSource();

    eventSource = new EventSource(`${BASE_URL}/interview/${interview_id}/stream`, { withCredentials: true });

    eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);

        if (data.role === 'user') {
            return;
        }

        if (data.role === 'ai') {
            if (!currentAIDiv) {
                removeLoading();
                currentAIDiv = document.createElement('div');
                currentAIDiv.className =
                    'self-start bg-[#4f817a]/10 text-[#1f3f3a] px-4 py-2 rounded-xl inline-block max-w-xl break-words';
                chatBox.appendChild(currentAIDiv);
            }

            typingBuffer += data.text;
            startTypingEffect();

            if (data.isFinal) {
                const checkDone = setInterval(() => {
                    if (!typingBuffer.length && !typingTimer) {
                        isAIResponding = false;
                        setSendEnabled(true);
                        currentAIDiv = null;
                        clearInterval(checkDone);
                    }
                }, 100);
            }
        }

    };

    eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        isAIResponding = false;
        setSendEnabled(true);
        removeLoading();
    };

    eventSource.onopen = () => {
        console.log('EventSource connected successfully');
    };
}

document.getElementById('backBtn').addEventListener('click', () => {
    closeEventSource();
    loadPage(page);
});

window.addEventListener('beforeunload', closeEventSource);

function isNearBottom() {
    const threshold = 50;
    return chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < threshold;
}

let autoScroll = true;

chatBox.addEventListener('scroll', () => {
    const distance = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
    autoScroll = distance < 1;
});

function scrollToBottom() {
    if (autoScroll) {
        requestAnimationFrame(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    }
}

function setSendEnabled(enabled) {
    if (enabled) {
        sendBtn.disabled = false;
        endBtn.disabled = false;
        sendBtn.classList.remove('cursor-not-allowed', 'opacity-50');
        endBtn.classList.remove('cursor-not-allowed', 'opacity-50');
        sendBtn.innerHTML = 'Send';
    } else {
        sendBtn.disabled = true;
        endBtn.disabled = true;
        sendBtn.classList.add('cursor-not-allowed', 'opacity-50');
        endBtn.classList.add('cursor-not-allowed', 'opacity-50');
        sendBtn.innerHTML = `
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 
                         0 5.373 0 12h4zm2 5.291A7.962 7.962 
                         0 014 12H0c0 3.042 1.135 5.824 
                         3 7.938l3-2.647z"></path>
            </svg>`;
    }
}

function sendMessage(text) {
    if (!text || isAIResponding) return;

    isAIResponding = true;
    setSendEnabled(false);

    if (text !== START_INTERVIEW_CODE) {
        const userMessage = document.createElement('div');
        userMessage.className =
            'self-end bg-[#4f817a] text-white px-4 py-1.5 rounded-xl inline-block max-w-xl';
        userMessage.textContent = text;
        chatBox.appendChild(userMessage);
        scrollToBottom();
    }

    showLoading();

    fetch(`${BASE_URL}/interview/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ interview_id, text })
    })
        .catch(error => {
            console.error('Send message error:', error);
            isAIResponding = false;
            setSendEnabled(true);
            removeLoading();
        });
}

let isSubmitting = false;

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    isSubmitting = true;

    const text = chatInput.value.trim();
    if (text) {
        sendMessage(text);
        chatInput.value = '';
    }

    setTimeout(() => {
        isSubmitting = false;
    }, 500);
});

let currentAIDiv = null;
let typingBuffer = '';
let typingTimer = null;
let loadingDiv = null;

function showLoading() {
    loadingDiv = document.createElement('div');
    loadingDiv.className = 'self-start bg-gray-300 rounded-xl w-24 h-6 my-2 animate-pulse';
    chatBox.appendChild(loadingDiv);
    scrollToBottom();
}

function removeLoading() {
    if (loadingDiv) {
        loadingDiv.remove();
        loadingDiv = null;
    }
}

function startTypingEffect() {
    if (typingTimer) return;
    typingTimer = setInterval(() => {
        if (typingBuffer.length > 0) {
            currentAIDiv.textContent += typingBuffer.charAt(0);
            typingBuffer = typingBuffer.slice(1);
            scrollToBottom();
        } else {
            clearInterval(typingTimer);
            typingTimer = null;
        }
    }, 10);
}

async function getResults() {
    try {
        const res = await fetch(`${BASE_URL}/interview/${interview_id}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) return null;

        const data = await res.json();
        return data.results || null;
    } catch (err) {
        console.error('Error fetching results:', err);
        return null;
    }
}

async function getMessages() {
    try {
        const res = await fetch(`${BASE_URL}/interview/${interview_id}/message`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) return [];

        const data = await res.json();
        return data.messages || [];
    } catch (err) {
        console.error('Error fetching messages:', err);
        return [];
    }
}

async function renderResults(results) {
    chatArea.classList.add('hidden');
    endBtn.classList.add('hidden');

    const hr = document.createElement('hr');
    hr.className = 'my-6 border-gray-300';
    chatBox.appendChild(hr);

    const heading = document.createElement('div');
    heading.className = 'text-lg font-semibold text-indigo-700 mb-2 text-center';
    heading.textContent = 'Summary of the interview results';
    chatBox.appendChild(heading);

    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'bg-gray-100 text-gray-800 p-4 rounded-xl whitespace-pre-wrap';
    chatBox.appendChild(summaryDiv);

    let total = 0;
    let count = results.scores.length;

    let output = '';
    results.scores.forEach(item => {
        output += `• ${item.title}: ${item.score} / 10\n`;
        total += item.score;
    });

    const avg = (count > 0 ? (total / count).toFixed(2) : 0);
    output += `\nAverage Score: ${avg} / 10\n`;
    if (results.suggestions) {
        output += `\nSuggestions: ${results.suggestions}`;
    }

    summaryDiv.textContent = output;
    scrollToBottom();
}

endBtn.addEventListener('click', async () => {
    closeEventSource();

    chatArea.classList.add('hidden');
    endBtn.classList.add('hidden');

    const loadingSummary = document.createElement('div');
    loadingSummary.className = 'flex items-center justify-center gap-2 text-gray-600 my-4';
    loadingSummary.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 
                     0 5.373 0 12h4zm2 5.291A7.962 
                     7.962 0 014 12H0c0 3.042 1.135 
                     5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Summarizing interview results...</span>
    `;
    chatBox.appendChild(loadingSummary);
    scrollToBottom();

    try {
        await fetch(`${BASE_URL}/interview/${interview_id}/finish`, {
            method: 'POST',
            credentials: 'include'
        });

        const results = await getResults();
        loadingSummary.remove();

        if (results) renderResults(results);
    } catch (err) {
        console.error(err);
    }
});

async function initInterview() {
    setSendEnabled(false);
    createEventSource();

    const oldMessages = await getMessages();

    if (oldMessages.length === 0) {
        sendMessage(START_INTERVIEW_CODE);
        chatArea.classList.remove('hidden');
        endBtn.classList.remove('hidden');
    } else {
        for (const msg of oldMessages) {
            if (msg.text === START_INTERVIEW_CODE) continue;
            renderMessage(msg);
        }
        scrollToBottom();

        const results = await getResults();
        if (results) {
            await renderResults(results);
        } else {
            chatArea.classList.remove('hidden');
            endBtn.classList.remove('hidden');
            setSendEnabled(true);
        }
    }
}

function renderMessage(msg) {
    const div = document.createElement('div');

    if (msg.role === 'user') {
        div.className =
            'self-end bg-[#4f817a] text-white px-4 py-2 rounded-xl inline-block max-w-xl break-words';
    } else {
        div.className =
            'self-start bg-[#4f817a]/10 text-[#1f3f3a] px-4 py-2 rounded-xl inline-block max-w-xl break-words';
    }

    div.textContent = msg.text;
    chatBox.appendChild(div);
    scrollToBottom();
}


initInterview();