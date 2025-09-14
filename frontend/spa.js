const navbar = document.getElementById("navbar")

// routes remain the same as your object (keys are "/login", "/register", etc.)
const routes = {
  "/": renderAuthPage,
  "/login": renderAuthPage,
  "/register": renderAuthPage,
  "/job-post": renderJobPostsPage,
  "/interview": renderInterviewPage,
  "/history": renderHistoryPage,
};
const authPages = ["/login", "/register", "/"];

const app = document.getElementById("app");

// Convert current location.hash to normalized path string like "/login"
function getPathFromHash(hash) {
  // Accept formats: "#/login", "#login", "" (empty), "#"
  if (!hash || hash === "#" || hash === "#/") return "/";
  // remove leading '#'
  let h = hash.startsWith("#") ? hash.slice(1) : hash;
  // if it doesn't start with '/', add it
  if (!h.startsWith("/")) h = "/" + h;
  // strip trailing slash except root
  if (h.length > 1 && h.endsWith("/")) h = h.slice(0, -1);
  return h;
}


// Renders the correct page based on path
function render(path) {
  // debug
  // console.log("render path:", path);

  const page = routes[path] || (() => [`<h1 class="text-2xl">404 Not Found</h1>`, null]);

  // Page can be a function that returns [htmlString, initFn]
  const result = page();
  const PageHTML = Array.isArray(result) ? result[0] : result;
  const initPage = Array.isArray(result) ? result[1] : null;

  if (typeof PageHTML === "string") app.innerHTML = PageHTML;
  if (typeof initPage === "function") initPage();

  const isAuthPage = authPages.includes(path);
  if (isAuthPage) {
    if (!navbar.classList.contains("hidden")) {
      navbar.classList.add("hidden")
    }
  } else {
    navbar.classList.remove("hidden")
  }
}

// --- Route Guard --- //
function checkAuth(path) {
  loadUser();

  const isAuthPage = authPages.includes(path);

  if (!currentUser && !isAuthPage) {
    // not logged in, force to login
    navigate("/login");
    alert("You must be logged in to access this page")
    return false;
  }
  if (currentUser && isAuthPage) {
    // already logged in, don’t allow going back to login/register
    alert("You already logged in")
    navigate("/job-post");
    return false;
  }
  return true;
}

// --- Patch render to enforce auth --- //
function guardedRender(path) {
  if (!checkAuth(path)) return; // checkAuth already redirected
  render(path);
}

// Navigate programmatically (sets hash so works on file://)
function navigate(path) {
  if (!path) path = "/";
  // normalize path to start with '/'
  if (!path.startsWith("/")) path = "/" + path;
  if (getPathFromHash(location.hash) === "/interview" && !confirm("If you exit the page, current interview would end. Are you sure?")) return fetchEndInterview()

  // set hash (this creates a history entry)
  location.hash = "#" + path;
  // render will be triggered by hashchange event, but call render immediately for faster UX
  guardedRender(path);
}

// Replace calls to render() in your router with guardedRender()
window.addEventListener("hashchange", () => {
  const path = getPathFromHash(location.hash);
  guardedRender(path);
});

// Handle clicks on <a data-link> anchors
document.addEventListener("click", (e) => {
  // allow clicks on elements inside <a data-link> (bubble)
  const a = e.target.closest && e.target.closest("[data-link]");
  if (!a) return;

  e.preventDefault();

  // href might be "#/login" or "/login" or just "login"
  let href = a.getAttribute("href") || a.dataset.href || "";
  if (href.startsWith("#")) {
    href = href.slice(1); // remove leading '#'
  }
  // normalize to path with leading slash
  if (!href.startsWith("/")) href = "/" + href;

  navigate(href);
});

document.addEventListener("DOMContentLoaded", () => {
  const initialPath = getPathFromHash(location.hash);
  guardedRender(initialPath);
});
