const app = document.getElementById("app");
const pagesWithNavbar = ["job-post", "interviews", "profile"];

let isLoading = false;
let isInitialized = false;

async function loadPage(page) {
    if (isLoading) return;
    
    isLoading = true;

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

        document.querySelectorAll('script[data-dynamic-script]').forEach(script => {
            script.remove();
        });

        if (pagesWithNavbar.includes(page)) {
            await LoadNavbar();
        } else {
            const navbarPlaceholder = document.getElementById("navbar-placeholder");
            if (navbarPlaceholder) navbarPlaceholder.innerHTML = "";
        }

        const scriptPath = `./scripts/${page}.js?${Date.now()}`;
        const pageScript = document.createElement("script");
        pageScript.src = scriptPath;
        pageScript.type = "module";
        pageScript.setAttribute('data-dynamic-script', 'page');
        pageScript.setAttribute('data-page', page);
        app.appendChild(pageScript);

    } catch (err) {
        app.innerHTML = `<h1>Page not Found</h1>`;
    } finally {
        isLoading = false;
    }
}

async function LoadNavbar() {
    const placeholder = document.getElementById("navbar-placeholder");
    if (!placeholder) return;

    try {
        const res = await fetch("./pages/navbar.html");
        placeholder.innerHTML = await res.text();

        document.querySelectorAll('script[data-dynamic-script="navbar"]').forEach(script => {
            script.remove();
        });

        const navbarScript = document.createElement("script");
        navbarScript.type = "module";
        navbarScript.src = `./scripts/navbar.js?${Date.now()}`;
        navbarScript.setAttribute('data-dynamic-script', 'navbar');
        document.body.appendChild(navbarScript);
    } catch (err) {
    }
}

document.addEventListener("click", (e) => {
    const pageLink = e.target.closest("[data-page]");
    if (!pageLink) return;

    e.preventDefault();
    const page = pageLink.getAttribute("data-page");
    loadPage(page);
});

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    isInitialized = true;

    AppState.loadUser().then(() => {
        if (AppState.isLoggedIn()) {
            loadPage("job-post");
        } else {
            loadPage("login");
        }
    });
});

if (document.readyState === 'loading') {

} else {
    if (!isInitialized) {
        isInitialized = true;
        AppState.loadUser().then(() => {
            if (AppState.isLoggedIn()) {
                loadPage("job-post");
            } else {
                loadPage("login");
            }
        });
    }
}