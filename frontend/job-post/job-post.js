// Mock jobpost data
const mockJobPost = [
  {
    id: 1,
    title: "Frontend Developer",
    description:
      "Interview for a React/JavaScript frontend developer position. Focus on component architecture, state management, and modern web development practices.",
    language: "en",
    created_at: "2024-01-15",
  },
  {
    id: 2,
    title: "Backend Engineer",
    description:
      "Server-side development interview covering APIs, databases, system design, and scalability considerations.",
    language: "en",
    created_at: "2024-01-14",
  },
  {
    id: 3,
    title: "Product Manager",
    description:
      "Product management role focusing on strategy, user research, roadmap planning, and cross-functional collaboration.",
    language: "en",
    created_at: "2024-01-13",
  },
]

// Mock API functions
async function getJobPost() {
  // TODO: complete get job post
  const response = await fetch(`${API_BASE_URL}/scenarios`, {
      credentials: 'include'
  });
  return await response.json();

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve({ data: mockJobPost, meta: { total: mockJobPost.length } })
  //   }, 300)
  // })
}

async function createJobPost(title, description, language) {
  // TODO: complete create job post
  const response = await fetch('/api/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, description, language })
  });
  return await response.json();

  // return new Promise((resolve) => {
  //   setTimeout(() => {
  //     const newJobPost = {
  //       id: mockJobPost.length + 1,
  //       title,
  //       description,
  //       language,
  //       created_at: new Date().toISOString(),
  //     }
  //     mockJobPost.push(newJobPost)
  //     resolve(newJobPost)
  //   }, 500)
  // })
}



// Load jobpost (handles "no job posts" case)
async function loadJobPost() {
  const result = await getJobPost();
  const jobPostList = document.getElementById("jobPostList");
  if (!jobPostList) return;

  // normalize result.data to array
  const posts = Array.isArray(result?.data) ? result.data : [];

  if (posts.length === 0) {
    jobPostList.innerHTML = `
      <div class="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
        <h3 class="text-lg font-semibold mb-2">No job posts yet</h3>
        <p class="text-sm text-gray-600 mb-4">
          There are no job posts right now. Create a job post so candidates can start interviews.
        </p>
      </div>
    `;

    // attach button action: prefer createJobPost() if available, otherwise navigate to a create route
    const createBtn = document.getElementById("createJobBtn");
    if (createBtn) {
      createBtn.addEventListener("click", () => {
        if (typeof createJobPost === "function") {
          createJobPost(); // call your existing create function if present
        } else {
          // fallback: navigate to a create page / hash route - adjust to your routing
          window.location.hash = "#/jobposts/new";
        }
      });
    }
    return;
  }

  // If there are posts, render them
  jobPostList.innerHTML = posts
    .map(
      (jobpost) => `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${escapeHtml(jobpost.title)}</h3>
            <p class="text-gray-600 text-sm mb-4">${escapeHtml(jobpost.description)}</p>
            <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Language: ${String(jobpost.language || '').toUpperCase()}</span>
                <button onclick="onClickStartInterview(${jobpost.id})" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                    Start Interview
                </button>
            </div>
        </div>
      `,
    )
    .join("");
}

// small helper to reduce XSS risk when inserting unknown strings
function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// Start interview
function onClickStartInterview(jobpostId) {
  localStorage.setItem("selectedJobPost", jobpostId)
  if (typeof navigate === 'function') navigate('interview');
}