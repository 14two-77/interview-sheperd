document.querySelectorAll(".toggle-password").forEach(el => {
    el.addEventListener("click", () => {
        const input = document.getElementById(el.dataset.target);
        if (!input) return;
        if (input.type === "password") {
            input.type = "text";
            el.classList.remove("fa-eye");
            el.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            el.classList.remove("fa-eye-slash");
            el.classList.add("fa-eye");
        }
    });
});

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    ShowLoading();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        await Fetch("auth/login", {
            method: "POST",
            body: { username, password }
        });

        HideLoading();
        await Alert("Login Successfully");
        await AppState.loadUser();

        if (AppState.isLoggedIn()) loadPage("job-post");
    } catch (err) {
        HideLoading();
        await Alert("Login Failed");
    }
});

