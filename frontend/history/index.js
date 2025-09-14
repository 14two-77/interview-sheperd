function renderHistoryPage() {
  return [`
  <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Interview History</h2>
    <div id="historyList" class="space-y-4"></div>
    <div id="emptyState" class="text-center py-12 hidden">
      <div class="text-gray-400 text-lg mb-4">No interview history yet</div>
      <button id="spaStartFirstInterview" class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
        Start Your First Interview
      </button>
    </div>
  </main>

  <!-- Result Detail Modal -->
  <div id="detailModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[75vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Interview Details</h3>
        <button id="closeDetail" class="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div id="detailContent"></div>
    </div>
  </div>
  `, () => {
      document.getElementById("closeDetail").addEventListener("click", () => {
        document.getElementById("detailModal").classList.add("hidden")
        document.getElementById("detailModal").classList.remove("flex")
      })
      // Attach SPA navigation events
      const spaStartFirstInterview = document.getElementById('spaStartFirstInterview');
      if (spaStartFirstInterview) spaStartFirstInterview.onclick = () => navigate('job-post');
      // Call original page logic if needed
      if (typeof loadHistory === 'function') loadHistory();
    }];
  // Modal handlers
}
