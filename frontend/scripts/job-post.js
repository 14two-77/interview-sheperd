loadJobPost();

const createModal = document.getElementById("createModal");
const createForm = document.getElementById("createJobPostForm");
const createBtn = document.getElementById("createJobPostBtn");
const cancelBtn = document.getElementById("cancelCreate");

window.toggleMenu = function (id, event) {
    event.stopPropagation();

    document.querySelectorAll(".dropdown-menu").forEach(m => {
        if (m.id !== `menu-${id}`) m.classList.add("hidden");
    });

    const menu = document.getElementById(`menu-${id}`);
    if (menu) {
        menu.classList.toggle("hidden");
    }
};

document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown-menu").forEach(m => m.classList.add("hidden"));
});

function showCreateJobPostModal() {
    createForm.reset();
    createModal.classList.remove("hidden");
    createModal.classList.add("flex");
    delete createForm.dataset.editId;
}

createBtn.addEventListener("click", showCreateJobPostModal);

cancelBtn.addEventListener("click", () => {
    createModal.classList.add("hidden");
    createModal.classList.remove("flex");
});

createModal.addEventListener("click", (e) => {
    if (e.target === createModal) {
        createModal.classList.add("hidden");
        createModal.classList.remove("flex");
    }
});

createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const editId = createForm.dataset.editId;
    if (editId) {
        await updateJobPost(editId);
        delete createForm.dataset.editId;
    } else await createJobPost();

    createModal.classList.add("hidden");
    createModal.classList.remove("flex");
    createForm.reset();

    loadJobPost();
});

async function loadJobPost() {
    try {
        const [resultMe, resultOther] = await Promise.all([
            Fetch("scenarios/me", { method: "GET" }),
            Fetch("scenarios/other", { method: "GET" })
        ]);

        const myPosts = Array.isArray(resultMe) ? resultMe : [];
        const otherPosts = Array.isArray(resultOther) ? resultOther : [];

        const myJobPostList = document.getElementById("myJobPostList");
        const otherJobPostList = document.getElementById("otherJobPostList");
        if (!myJobPostList || !otherJobPostList) return;

        function renderPosts(list, isMine = false) {
            if (list.length === 0) {
                return `
                    <div class="col-span-full flex items-center justify-center my-10">
                        <div class="rounded-lg text-center text-gray-700 text-lg">
                            No jobs found
                        </div>
                    </div>
                `;
            }

            return list.map(jobpost => `
                <div class="bg-[#f0f5f4] border border-[#4f817a33] rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col h-full relative">
                    ${isMine ? `
                    <div class="absolute top-2 right-2">
                        <button onclick="toggleMenu('${jobpost._id}', event)" class="p-1 text-gray-500 hover:text-[#4f817a]">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div id="menu-${jobpost._id}" 
                            class="dropdown-menu hidden absolute right-0 w-24 bg-[#f0f5f4] border border-[#4f817a33] rounded-lg shadow-lg z-10">
                            <button onclick="editJob('${jobpost._id}')" class="block w-full text-left px-3 py-2 text-sm hover:bg-[#d1e0dd]">Edit</button>
                            <button onclick="deleteJob('${jobpost._id}')" class="block w-full text-left px-3 py-2 text-sm hover:bg-[#f5dede] text-red-600">Delete</button>
                        </div>
                    </div>
                    ` : ''}

                    <h3 class="text-md font-semibold text-[#2c4f4a] mb-2 min-h-[2.8rem] mt-2 break-words">
                        ${jobpost.title}
                    </h3>

                    <p class="text-gray-700 text-sm mb-4 flex-grow max-h-[20rem] overflow-y-auto">
                        ${jobpost.description}
                    </p>

                    <div class="flex justify-between items-center mt-auto pt-4 border-t border-[#4f817a33]">
                        <span class="text-xs text-gray-500">Language: ${String(jobpost.language || "").toUpperCase()}</span>
                        <button onclick="startInterview('${jobpost._id}')" 
                            class="bg-[#4f817a] text-white px-4 py-2 rounded-md hover:bg-[#446d68] text-sm transition">
                            Start
                        </button>
                    </div>
                </div>
            `).join("");
        }

        myJobPostList.innerHTML = renderPosts(myPosts, true);
        otherJobPostList.innerHTML = renderPosts(otherPosts, false);
    } catch (err) {
        console.error(err);
    }
}

async function createJobPost() {
    ShowLoading();
    const title = document.getElementById("jobpostTitle").value;
    const description = document.getElementById("jobpostDescription").value;
    const language = document.getElementById("jobpostLanguage").value;

    await Fetch("scenarios", {
        method: "POST",
        body: {
            title,
            description,
            language
        }
    })
        .then(async () => {
            HideLoading();
            await Alert("Created Job Succesfully");
        })
        .catch(() => HideLoading())
}

async function updateJobPost(id) {
    ShowLoading();
    const title = document.getElementById("jobpostTitle").value;
    const description = document.getElementById("jobpostDescription").value;
    const language = document.getElementById("jobpostLanguage").value;

    await Fetch(`scenarios/${id}`, {
        method: "PUT",
        body: { title, description, language }
    })
        .then(async () => {
            HideLoading();
            await Alert("Updated Job Succesfully");
        })
        .catch(() => HideLoading())
}

window.editJob = async function (id) {
    try {
        const job = await Fetch(`scenarios/${id}`, { method: "GET" });

        document.getElementById("jobpostTitle").value = job.title || "";
        document.getElementById("jobpostDescription").value = job.description || "";
        document.getElementById("jobpostLanguage").value = job.language || "";

        createForm.dataset.editId = id;

        createModal.classList.remove("hidden");
        createModal.classList.add("flex");
    } catch (err) {
        console.error(err);
    }
};

window.deleteJob = async function (id) {
    try {
        await Fetch(`scenarios/${id}`, { method: "GET" });

        ShowLoading();
        await Fetch(`scenarios/${id}`, { method: "DELETE" });
        HideLoading();
        await Alert("Deleted Job Successfully");

        loadJobPost();
    } catch (err) {
        console.error(err);
    }
};

const resumeModal = document.getElementById("resumeModal");
const resumeForm = document.getElementById("resumeForm");
const resumeText = document.getElementById("resumeText");
const cancelResume = document.getElementById("cancelResume");

let currentScenarioId = null;

window.startInterview = function (scenarios_id) {
    currentScenarioId = scenarios_id;
    resumeText.value = "";
    resumeModal.classList.remove("hidden");
    resumeModal.classList.add("flex");
};

cancelResume.addEventListener("click", () => {
    resumeModal.classList.add("hidden");
    resumeModal.classList.remove("flex");
    currentScenarioId = null;
});

resumeModal.addEventListener("click", (e) => {
    if (e.target === resumeModal) {
        resumeModal.classList.add("hidden");
        resumeModal.classList.remove("flex");
        currentScenarioId = null;
    }
});

resumeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentScenarioId) return;

    const resume = resumeText.value;

    try {
        ShowLoading();
        await Fetch("interview/start", {
            method: "POST",
            body: { scenario_id: currentScenarioId, resume_text: resume }
        })
            .then(async (res) => {
                HideLoading();
                sessionStorage.setItem('interview', res.interview_id);
                sessionStorage.setItem('page', "job-post");

                loadPage('interview');
            })
    } catch (err) {
        HideLoading();
        await Alert("Failed to start interview.");

        resumeModal.classList.add("hidden");
        resumeModal.classList.remove("flex");
        currentScenarioId = null;
        resumeText.value = "";
    }
});
