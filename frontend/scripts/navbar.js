const logoutBtn = document.querySelector("nav [data-logout]");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        ShowLoading();
        await Fetch("auth/logout", { method: "POST" });
        HideLoading();
        await Alert("Logout Successfully");
        AppState.user = null;
        loadPage("login");
    });
}

const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
        if (!menu.classList.contains("hidden")) {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.add("hidden");
            }
        }
    });
}

document.querySelectorAll("nav [data-page]").forEach(link => {
    link.addEventListener("click", (e) => {
        const page = link.getAttribute("data-page");
        if (page) loadPage(page);

        if (!menu.classList.contains("hidden") && window.innerWidth < 768) {
            menu.classList.add("hidden");
        }
    });
});