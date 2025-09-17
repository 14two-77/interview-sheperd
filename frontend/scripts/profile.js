ShowLoading();

async function getUser() {
    try {
        const res = await Fetch("user", { method: "GET" });
        document.getElementById("username").value = res.user.username;
        HideLoading();
    } catch (err) {
        console.log(err);
        HideLoading();
    }
}

getUser();

const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");

function updateRequired() {
    if (passwordInput.value || confirmInput.value) {
        passwordInput.required = true;
        confirmInput.required = true;
    } else {
        passwordInput.required = false;
        confirmInput.required = false;
    }
}

passwordInput.addEventListener("input", updateRequired);
confirmInput.addEventListener("input", updateRequired);

document.getElementById("profile-edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    ShowLoading();

    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (password && password !== confirmPassword) {
        HideLoading();
        await Alert("Passwords do not match!");
        return;
    }

    const body = { username };
    if (password) body.password = password;

    try {
        await Fetch("user", {
            method: "PUT",
            body
        });

        HideLoading();
        await Alert("Updated Successfully");

        passwordInput.value = "";
        confirmInput.value = "";
        updateRequired();
    } catch (err) {
        HideLoading();
        await Alert(err.data.error || "Update failed");
    }
});