function Fetch(url, options = {}) {
    const fetchOptions = {
        method: options.method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include'
    };

    if (options.body) fetchOptions.body = JSON.stringify(options.body);

    return new Promise(async (resolve, reject) => {
        try {
            const res = await fetch(`${BASE_URL}/${url}`, fetchOptions);
            const data = await res.json();

            if (!res.ok) return reject({ status: res.status, data });

            resolve(data);
        } catch (err) {
            reject(err);
        }
    });
}

const alertModal = document.getElementById("alert-modal");
const alertMessage = document.getElementById("alert-message");
const alertClose = document.getElementById("alert-close");

function Alert(message, blocking = true, delay = 3000) {
    if (!blocking) {
        alertMessage.textContent = message;
        alertModal.classList.remove("hidden");
        setTimeout(() => alertModal.classList.add("hidden"), delay);
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        alertMessage.textContent = message;
        alertModal.classList.remove("hidden");

        let timeoutId;

        const closeHandler = () => {
            clearTimeout(timeoutId);
            alertModal.classList.add("hidden");
            alertClose.removeEventListener("click", closeHandler);
            document.removeEventListener("keydown", escHandler);
            alertModal.removeEventListener("click", outsideClickHandler);
            resolve();
        };

        const escHandler = (e) => {
            if (e.key === "Escape") closeHandler();
        };

        const outsideClickHandler = (e) => {
            if (e.target === alertModal) closeHandler();
        };

        alertClose.addEventListener("click", closeHandler);
        document.addEventListener("keydown", escHandler);
        alertModal.addEventListener("click", outsideClickHandler);

        timeoutId = setTimeout(closeHandler, delay);
    });
}


const loadingOverlay = document.getElementById("loading-overlay");

function ShowLoading() {
    loadingOverlay.classList.remove("hidden");
}

function HideLoading() {
    loadingOverlay.classList.add("hidden");
}

async function LoadNavbar() {
    const placeholder = document.getElementById("navbar-placeholder");
    if (!placeholder) return;

    try {
        const res = await fetch("./pages/navbar.html");
        placeholder.innerHTML = await res.text();

        const script = document.createElement("script");
        script.type = "module";
        script.src = `./scripts/navbar.js?${Date.now()}`;
        document.body.appendChild(script);

    } catch (err) {
        console.error("Error loading navbar:", err);
    }
}
