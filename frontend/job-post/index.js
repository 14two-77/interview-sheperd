function renderJobPostsPage() {
  return [`
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Job Posts</h2>
      <button id="createJobPostBtn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Create a Job Post</button>
    </div>
    <div id="jobPostList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
  </main>

  <!-- Create JobPost Modal -->
  <div id="createModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-semibold mb-4">Create a Job Post</h3>
      <form id="createJobPostForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" id="jobpostTitle" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="jobpostDescription" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select id="jobpostLanguage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="en">English</option>
            <option value="th">Thai</option>
          </select>
        </div>
        <div class="flex space-x-3">
          <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Create</button>
          <button type="button" id="cancelCreate" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400">Cancel</button>
          </div>
          </form>
          </div>
          </div>
          `, () => {
      // Display user greeting
      document.getElementById("userGreeting").textContent = `Hello, ${currentUser.display_name || currentUser.username}`
      // Modal handlers
      document.getElementById("createJobPostBtn").addEventListener("click", () => {
        
        document.getElementById("createModal").classList.remove("hidden")
        document.getElementById("createModal").classList.add("flex")
      })

      document.getElementById("cancelCreate").addEventListener("click", () => {
        document.getElementById("createModal").classList.add("hidden")
        document.getElementById("createModal").classList.remove("flex")
      })

      // Create jobpost form
      document.getElementById("createJobPostForm").addEventListener("submit", async (e) => {
        e.preventDefault()
        const title = document.getElementById("jobpostTitle").value
        const description = document.getElementById("jobpostDescription").value
        const language = document.getElementById("jobpostLanguage").value

        await createJobPost(title, description, language)

        // Close modal and reload jobpost
        document.getElementById("createModal").classList.add("hidden")
        document.getElementById("createModal").classList.remove("flex")
        document.getElementById("createJobPostForm").reset()
        loadJobPost()
      })

      // Call original page logic if needed
      if (typeof loadJobPost === 'function') loadJobPost();
    }];
}