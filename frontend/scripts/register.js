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

document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    ShowLoading();

    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm-password").value;

    if (password !== confirm) {
        HideLoading();
        await Alert("Passwords do not match");
        return;
    }

    try {
        await Fetch("auth/register", {
            method: "POST",
            body: { username, password }
        });
        HideLoading();
        await Alert("Register Successfully");
        loadPage("login");
    } catch (err) {
        HideLoading();
        await Alert("Register Failed");
    }
});
