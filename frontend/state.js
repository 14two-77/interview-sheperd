// --- Auth Utils ---
let currentUser = null;

function loadUser() {
  const saved = localStorage.getItem("user");
  try {
    currentUser = saved ? JSON.parse(saved) : null;
  } catch {
    currentUser = null;
  }
  return currentUser;
}

function saveUser(user) {
  currentUser = user;
  localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
  currentUser = null;
  localStorage.removeItem("user");
  // remove all cookies (basic, clears session cookies)
  document.cookie.split(";").forEach(c => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  navigate("/login");
}

// --- Global Application State ---
const appState = {
  // Which view is currently active inside interview
  interviewView: "interview", // "interview" | "feedback"

  // Interview-related session info
  interviewId: null,
  jobpostId: null,
  resumeContent: null,
  chatHistory: [],
  isStreaming: false
};

function resetInterviewState() {
  appState.interviewView = "interview";
  appState.interviewId = null;
  appState.jobpostId = null;
  appState.resumeContent = null;
  appState.chatHistory = [];
  appState.isStreaming = false;
}
