// Load interview history
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("interviewHistory") || "[]")
  const historyList = document.getElementById("historyList")
  const emptyState = document.getElementById("emptyState")

  if (history.length === 0) {
    historyList.classList.add("hidden")
    emptyState.classList.remove("hidden")
    return
  }

  historyList.innerHTML = history
    .map(
      (interview, index) => `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${interview.jobpost_title}</h3>
                    <p class="text-gray-600 text-sm mb-2">
                        Completed: ${new Date(interview.completed_at).toLocaleDateString()} at ${new Date(interview.completed_at).toLocaleTimeString()}
                    </p>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center">
                            <span class="text-sm text-gray-600 mr-2">Overall Score:</span>
                            <span class="font-semibold text-lg ${getScoreColor(interview.score)}">${Math.round(interview.score)}/100</span>
                        </div>
                    </div>
                </div>
                <button onclick="showDetail(${index})" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                    View Details
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function getScoreColor(score) {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

function showDetail(index) {
  const history = JSON.parse(localStorage.getItem("interviewHistory") || "[]")
  const interview = history[index]

  if (!interview) return

  const detailContent = document.getElementById("detailContent")
  detailContent.innerHTML = `
        <div class="space-y-6">
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Overall Score</h4>
                <div class="text-2xl font-bold ${getScoreColor(interview.score)}">${Math.round(interview.score)}/100</div>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-900 mb-3">Performance Breakdown</h4>
                <div class="space-y-2">
                    ${Object.entries(interview.result.criteria)
      .map(
        ([key, value]) => `
                        <div class="flex items-center justify-between">
                            <span class="capitalize text-gray-700">${key}</span>
                            <div class="flex items-center">
                                <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${value}%"></div>
                                </div>
                                <span class="text-sm font-medium">${value}/100</span>
                            </div>
                        </div>
                    `,
      )
      .join("")}
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-gray-900 mb-2">Interview Feedback</h4>
                <p class="text-gray-700 text-sm bg-green-50 p-3 rounded-lg">${interview.result.interview_suggestions}</p>
            </div>
        </div>
    `

  document.getElementById("detailModal").classList.remove("hidden")
  document.getElementById("detailModal").classList.add("flex")
}