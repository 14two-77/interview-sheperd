// --- Lazy DOM getters (query only when needed, cache result) ---
let _loadingEl = null;
let _contentEl = null;
let _views = {};
let _chatBox = null;
let _chatForm = null;
let _chatInput = null;
let _endInterviewBtn = null;
let _feedbackContent = null;
let _newInterviewBtn = null;
let _modal = null;
let _modalTitle = null;
let _modalMessage = null;
let _modalCloseBtn = null;

function getLoadingEl() {
  if (!_loadingEl) _loadingEl = document.getElementById('loading');
  return _loadingEl;
}
function getContentEl() {
  if (!_contentEl) _contentEl = document.getElementById('content');
  return _contentEl;
}
function getViewEl(name) {
  if (!_views[name]) _views[name] = document.getElementById(`view-${name}`);
  return _views[name];
}
function getChatBox() {
  if (!_chatBox) _chatBox = document.getElementById('chatBox');
  return _chatBox;
}
function getChatForm() {
  if (!_chatForm) _chatForm = document.getElementById('chatForm');
  return _chatForm;
}
function getChatInput() {
  if (!_chatInput) _chatInput = document.getElementById('chatInput');
  return _chatInput;
}
function getEndInterviewBtn() {
  if (!_endInterviewBtn) _endInterviewBtn = document.getElementById('endInterviewBtn');
  return _endInterviewBtn;
}
function getFeedbackContent() {
  if (!_feedbackContent) _feedbackContent = document.getElementById('feedbackContent');
  return _feedbackContent;
}
function getNewInterviewBtn() {
  if (!_newInterviewBtn) _newInterviewBtn = document.getElementById('newInterviewBtn');
  return _newInterviewBtn;
}
function getModal() {
  if (!_modal) _modal = document.getElementById('modal');
  return _modal;
}
function getModalTitle() {
  if (!_modalTitle) _modalTitle = document.getElementById('modalTitle');
  return _modalTitle;
}
function getModalMessage() {
  if (!_modalMessage) _modalMessage = document.getElementById('modalMessage');
  return _modalMessage;
}
function getModalCloseBtn() {
  if (!_modalCloseBtn) _modalCloseBtn = document.getElementById('modalCloseBtn');
  return _modalCloseBtn;
}

// --- Utility Functions ---
function setView(viewName) {
  // use view getters
  const viewNames = ['interview', 'feedback'];
  viewNames.forEach((vn) => {
    const vEl = getViewEl(vn);
    if (vEl) vEl.classList.add('hidden');
  });

  const toShow = getViewEl(viewName);
  if (toShow) {
    toShow.classList.remove('hidden');
    appState.view = viewName;
    if (viewName === 'interview') {
      const cb = getChatBox();
      if (cb) cb.scrollTop = cb.scrollHeight;
    }
  }
}

function showLoadingInterview(show) {
  const loadingEl = getLoadingEl();
  const contentEl = getContentEl();
  if (loadingEl) {
    loadingEl.style.display = show ? 'flex' : 'none';
  }
  if (contentEl) {
    contentEl.style.display = show ? 'none' : 'flex';
  }
}

function showModal(title, message) {
  const modal = getModal();
  const modalTitle = getModalTitle();
  const modalMessage = getModalMessage();
  if (modalTitle) modalTitle.textContent = title;
  if (modalMessage) modalMessage.textContent = message;
  if (modal) modal.classList.remove('hidden');
}

async function startInterview() {
  showLoadingInterview(true);
  try {
    // const response = await fetch(`${API_BASE_URL}/interviews/start`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   credentials: 'include',
    //   body: JSON.stringify({
    //     jobpost_id: appState.jobpostId,
    //     resume_text: appState.resumeContent
    //   })
    // });

    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.message);
    // }

    // const interview = await response.json();
    // appState.interviewId = interview.id;

    // simulate the first AI question (server may return it in real API)
    await appendMessageBubble('ai', "Hello, thanks for coming in. Can you tell me a little bit about yourself?");
  } catch (error) {
    console.error("Failed to start interview:", error);
    showModal('Error', 'Failed to start the interview. Please try again.');
  } finally {
    showLoadingInterview(false);
  }
}

// ---------- SSE-ready sendMessageAndGetReply (mock streaming for now) ----------
async function sendMessageAndGetReply(userMessage) {
  // guard: prevent multiple concurrent streams
  if (appState.isStreaming) {
    showModal('Please wait', 'Currently waiting for the AI response — please wait a moment.');
    return;
  }

  // Immediately add user's message
  appendMessageBubble('user', userMessage);

  // disable input while waiting/receiving
  enableChatInput(false);

  // For real backend you'd POST here. We try it but tolerate failures and fallback to mock streaming.
  let serverAiText = null;
  try {
    // try to send the message to server (non-blocking for streaming)
    const resp = await fetch(`${API_BASE_URL}/interviews/${appState.interviewId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: userMessage })
    });

    if (!resp.ok) {
      // we'll not throw yet — let mock streaming run (but log)
      console.warn('Server responded non-OK, falling back to mock stream', resp.status);
    } else {
      // If API returns an immediate ai_message, prefer it; otherwise the server might stream later via SSE.
      const json = await resp.json().catch(() => null);
      if (json && json.ai_message && typeof json.ai_message.text === 'string') {
        // If server returned full AI text synchronously (rare), use it as a single message.
        serverAiText = json.ai_message.text;
      }
      // If your real backend uses SSE, it might not return the AI text here — it will stream via EventSource.
    }
  } catch (err) {
    console.warn('Message POST failed — using mock stream. Error:', err);
    // continue to mock streaming
  }

  // If server provided an immediate AI text, show it directly (no streaming).
  if (serverAiText) {
    await appendMessageBubble('ai', serverAiText);
    enableChatInput(true);
    return;
  }

  // Prepare a placeholder AI bubble that we will update as chunks arrive
  const aiEl = appendMessageBubble('ai', ''); // starts empty
  // ensure the last history entry for AI is the placeholder (replace last entry if it was added by appendMessageBubble)
  if (appState.chatHistory && appState.chatHistory.length) {
    // last one is the placeholder we pushed in appendMessageBubble — we will update it at the end
  }

  // ---------- How to attach real SSE (template) ----------
  /*
    // Uncomment & use this when your backend exposes an SSE endpoint:
    const eventSourceUrl = `${API_BASE_URL}/interviews/${appState.interviewId}/stream`;
    const es = new EventSource(eventSourceUrl, { withCredentials: true });
    es.onmessage = (ev) => {
      // server should send partial chunks as individual messages
      const chunk = ev.data;
      updateMessageBubble(aiEl, chunk);
    };
    es.onerror = (err) => {
      console.error('SSE error', err);
      es.close();
      // finalize state & re-enable input
      enableChatInput(true);
    };
    es.addEventListener('done', () => {
      // server signals end (optionally)
      es.close();
      enableChatInput(true);
    });
  */

  // ---------- For now: use a mock streamer to simulate SSE behavior ----------
  // Create a plausible AI response (in the future you'll remove this and rely on SSE)
  const mockAiText = generateMockAIReply(userMessage);

  // start streaming chunks into the aiEl
  const cancelMock = startMockSSE(mockAiText, {
    chunkInterval: 60,
    chunkSize: 6,
    onChunk(chunk) {
      updateMessageBubble(aiEl, chunk);
    },
    onDone() {
      // mark final text into history (replace last entry)
      if (appState.chatHistory && appState.chatHistory.length) {
        // replace the last item which was the placeholder AI entry with final text
        appState.chatHistory[appState.chatHistory.length - 1] = { sender: 'ai', text: aiEl.textContent };
      } else {
        appState.chatHistory.push({ sender: 'ai', text: aiEl.textContent });
      }

      enableChatInput(true);
    }
  });

  // return cancel handle if caller wants to abort streaming
  return cancelMock;
}

async function fetchEndInterview() {
  const response = await fetch(`${API_BASE_URL}/interviews/${appState.interviewId}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response
}

async function getInterviewFeedback() {
  try {
    await fetchEndInterview()
    const data = await response.json();
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
    const feedbackContent = getFeedbackContent();
    if (feedbackContent) feedbackContent.innerHTML = formattedFeedback;

    setView('feedback');
  } catch (error) {
    console.error("Failed to get feedback:", error);
    showModal('Error', 'Failed to get feedback. Please try again.');
  } finally {
    // TODO: on interview finished
  }
}

// --- UI Event Handler factories (attach when DOM exists) ---
function attachChatFormHandler() {
  const chatForm = getChatForm();
  const chatInput = getChatInput();
  if (!chatForm || !chatInput) return;

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (appState.isStreaming) {
      showModal('Please wait', 'AI is still generating a response. Please wait until it finishes.');
      return;
    }

    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // send & stream reply
    chatInput.value = '';
    try {
      await sendMessageAndGetReply(userMessage);
    } catch (err) {
      console.error('Error during send/receive flow', err);
      showModal('Error', 'Something went wrong while sending your message.');
      enableChatInput(true);
    }
  });
}

function attachEndInterviewHandler() {
  const btn = getEndInterviewBtn();
  if (!btn) return;
  btn.addEventListener('click', async () => {
    if (!appState.interviewId) {
      showModal('Error', 'No interview session is active.');
      return;
    }
    const chatBox = getChatBox();
    if (!chatBox || chatBox.children.length < 2) {
      showModal('No Conversation', 'Please have a short conversation with the interviewer before ending the session.');
      return;
    }
    await getInterviewFeedback();
  });
}

function attachNewInterviewHandler() {
  const btn = getNewInterviewBtn();
  if (!btn) return;
  btn.addEventListener('click', () => {
    resetApp();
  });
}

function attachModalCloseHandler() {
  const btn = getModalCloseBtn();
  const modal = getModal();
  if (!btn || !modal) return;
  btn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

// Append a new bubble to the chat and return the element (so it can be updated)
function appendMessageBubble(sender, initialText = '') {
  const chatBox = getChatBox();
  if (!chatBox) return null;
  const messageEl = document.createElement('div');
  messageEl.className = 'message-bubble ' + (sender === 'ai' ? 'ai-bubble' : 'user-bubble');
  messageEl.textContent = initialText;
  chatBox.appendChild(messageEl);
  chatBox.scrollTop = chatBox.scrollHeight;
  // keep chat history minimal record (string only)
  appState.chatHistory = appState.chatHistory || [];
  appState.chatHistory.push({ sender, text: initialText });
  return messageEl;
}

// Update an existing bubble element with a chunk of text (append)
function updateMessageBubble(el, chunk) {
  if (!el) return;
  el.textContent += chunk;
  const cb = getChatBox();
  if (cb) cb.scrollTop = cb.scrollHeight;
}

// Enable/disable chat input & submit button
function enableChatInput(enabled) {
  const chatForm = getChatForm();
  if (!chatForm) return;
  const input = getChatInput();
  const submit = chatForm.querySelector('button[type="submit"]');
  if (input) input.disabled = !enabled;
  if (submit) {
    submit.disabled = !enabled;
    submit.classList.toggle('opacity-50', !enabled);
    submit.classList.toggle('cursor-not-allowed', !enabled);
  }
  // track streaming state
  appState.isStreaming = !enabled ? true : false;
}

// A mock SSE-like streamer for now; calls onChunk repeatedly then onDone.
// Keep this small — replace with real EventSource when backend is ready.
function startMockSSE(fullText, { onChunk, onDone, chunkInterval = 80, chunkSize = 8 } = {}) {
  // chunkSize = number of characters per chunk (small to look like typing)
  let pos = 0;
  const len = fullText.length;
  const t = setInterval(() => {
    if (pos >= len) {
      clearInterval(t);
      if (typeof onDone === 'function') onDone();
      return;
    }
    // slice next chunk
    const next = fullText.slice(pos, pos + chunkSize);
    pos += chunkSize;
    if (typeof onChunk === 'function') onChunk(next);
  }, chunkInterval);

  // return cancel handle
  return () => clearInterval(t);
}



// ---------- small mock AI reply generator (tweakable) ----------
function generateMockAIReply(userText) {
  // Very simple mock: echo back with some extra words and pretend to ask a follow-up
  const base = `Thanks — I understand "${userText}". That's interesting. Could you give a quick example to show how you handled a similar problem? `;
  const extras = [
    'For instance, describe a concrete architecture, what trade-offs you considered.',
    'Also mention any metrics you tracked and how you evaluated success.',
    'Finally, summarize what you learned and what you would do differently next time.'
  ];
  return base + extras.join(' ');
}



// --- App Lifecycle Functions ---
function resetApp() {
  appState.interviewId = null;
  const chatBox = getChatBox();
  const feedbackContent = getFeedbackContent();
  if (chatBox) chatBox.innerHTML = '';
  if (feedbackContent) feedbackContent.innerHTML = '';
  setView('interview');
  startInterview();
}

// --- Init UI (attach listeners only after the page is rendered) ---
function initUI() {
  // call getters to ensure elements are available and cache them
  getLoadingEl();
  getContentEl();
  getViewEl('interview');
  getViewEl('feedback');
  getChatBox();
  getChatForm();
  getChatInput();
  getEndInterviewBtn();
  getFeedbackContent();
  getNewInterviewBtn();
  getModal();
  getModalTitle();
  getModalMessage();
  getModalCloseBtn();

  // attach event listeners (guarded inside each attach function)
  attachChatFormHandler();
  attachEndInterviewHandler();
  attachNewInterviewHandler();
  attachModalCloseHandler();
}

