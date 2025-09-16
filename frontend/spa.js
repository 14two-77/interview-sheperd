const app = document.getElementById("app");
const pagesWithNavbar = ["job-post", "interviews", "profile"];

async function loadPage(page) {
    const protectedPages = ["interview", "interviews", "job-post", "profile"];
    const authPages = ["login", "register"];

    if (protectedPages.includes(page) && !AppState.isLoggedIn()) {
        page = "login";
    } else if (authPages.includes(page) && AppState.isLoggedIn()) {
        page = "job-post";
    }

    try {
        const res = await fetch(`./pages/${page}.html`);
        const html = await res.text();
        app.innerHTML = html;

        if (pagesWithNavbar.includes(page)) {
            await LoadNavbar();
        } else {
            const navbarPlaceholder = document.getElementById("navbar-placeholder");
            if (navbarPlaceholder) navbarPlaceholder.innerHTML = "";
        }

        const scriptPath = `./scripts/${page}.js?${Date.now()}`;
        const s = document.createElement("script");
        s.src = scriptPath;
        s.type = "module";
        app.appendChild(s);

    } catch (err) {
        console.error(err);
        app.innerHTML = `<h1>Page not Found</h1>`;
    }
}

document.addEventListener("click", (e) => {
    const pageLink = e.target.closest("[data-page]");
    if (!pageLink) return;

    e.preventDefault();
    const page = pageLink.getAttribute("data-page");
    loadPage(page);
});

AppState.loadUser().then(() => {
    if (AppState.isLoggedIn()) {
        loadPage("job-post");
    } else {
        loadPage("login");
    }
});
