// SPA: Render Interview page
function renderInterviewPage() {
  return [`
    <div class="app-card">
      <div id="loading" class="flex flex-col items-center justify-center h-full p-8 text-center hidden">
        <svg class="loading-spinner w-10 h-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500">Please wait, loading the interview...</p>
      </div>
      <div id="content" class="flex-grow p-6 sm:p-8 flex flex-col">
        <div class="mb-6 sm:mb-8 text-center">
          <h1 class="text-3xl sm:text-4xl font-semibold gradient-text mb-2">AI Interview Practice</h1>
          <p class="text-gray-600 text-sm sm:text-base">Prepare for your next interview with an AI-powered coach.</p>
        </div>
        <div id="view-interview" class="flex-grow flex flex-col">
          <div id="chatBox" class="chat-container"></div>
          <div class="mt-4 border-t border-gray-200 pt-4">
            <form id="chatForm" class="flex flex-col sm:flex-row gap-2">
              <input type="text" id="chatInput" placeholder="Type your answer here..." class="flex-grow p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <button type="submit" class="inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none transition-colors duration-200">Send</button>
            </form>
            <button id="endInterviewBtn" class="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 focus:outline-none transition-colors duration-200">End Interview & Get Feedback</button>
          </div>
        </div>
        <div id="view-feedback" class="flex flex-col flex-grow hidden">
          <h2 class="text-2xl font-semibold text-center text-gray-800 mb-6">Interview Feedback</h2>
          <div id="feedbackContent" class="overflow-y-auto flex-grow mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-700"></div>
          <button id="newInterviewBtn" class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 focus:outline-none transition-colors duration-200">Start a New Interview</button>
        </div>
      </div>
    </div>
    <div id="modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 hidden z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 id="modalTitle" class="text-lg font-semibold mb-4"></h3>
        <p id="modalMessage" class="mb-4"></p>
        <button id="modalCloseBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Close</button>
      </div>
    </div>
  `, () => {
      initUI();
      resetApp(); // calls startInterview which may rely on DOM elements existing
    }];
}
