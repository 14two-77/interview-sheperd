loadInterviews();

async function loadInterviews() {
    try {
        const result = await Fetch("interview", { method: "GET" });
        const container = document.getElementById("myInterviews");
        if (!container) return;

        if (!result || result.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex items-center justify-center my-10">
                    <div class="rounded-lg text-center text-gray-700 text-lg">
                        No Interviews found
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = result.map(item => {
            const status = item.results ? "Finish" : "In Progress";
            const statusColor = item.results ? "bg-green-200 text-gray-700" : "bg-yellow-100 text-yellow-800";
            const statusText = item.results ? "View" : "Continue";
            const statusColorBtn = item.results ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700";

            return `
                <div class="bg-[#f0f5f4] border border-[#4f817a33] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col h-full relative">
                    
                    <div class="absolute top-2 right-2 px-3 py-1 rounded-bl-lg text-xs font-semibold ${statusColor}">
                        ${status}
                    </div>

                    <h3 class="text-md font-semibold text-[#2c4f4a] mb-2 min-h-[2.8rem] mt-2 break-words">
                        ${item.title}
                    </h3>

                    <p class="text-gray-700 text-sm mb-4 flex-grow max-h-[20rem] overflow-y-auto">
                        ${item.description}
                    </p>

                    <div class="flex justify-between items-center mt-auto pt-4 border-t border-[#4f817a33]">
                        <span class="text-xs text-gray-500">Language: ${String(item.language || "").toUpperCase()}</span>
                        <button onclick="startInterview('${item._id}')" 
                            class="${statusColorBtn} text-white px-4 py-2 rounded-md text-sm transition">
                            ${statusText}
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
    }
}

window.startInterview = function (id) {
    sessionStorage.setItem('interview', id);
    sessionStorage.setItem('page', "interviews");

    loadPage('interview');
};
