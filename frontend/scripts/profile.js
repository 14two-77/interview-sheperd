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

ShowLoading();
getUser();

document.getElementById("profile-edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    ShowLoading();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password && password !== confirmPassword) {
        HideLoading();
        return Alert("Passwords do not match!");
    }

    try {
        await Fetch("user", {
            method: "PUT",
            body: { username, password }
        });

        HideLoading();
        await Alert("Updated Successfully");

        document.getElementById("password").value = "";
        document.getElementById("confirm-password").value = "";
    } catch (err) {
        HideLoading();
        await Alert("Updated Failed");
    }
});
