const BASE_URL = "http://localhost:3000/v1/auth";

// --- Tab switching ---
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// --- Register ---
async function register() {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const confirmPassword = document.getElementById("reg-confirm-password").value.trim();

  if (!username || !password || !confirmPassword) {
    showStatus("กรอกข้อมูลให้ครบ", "error");
    return;
  }

  if (confirmPassword !== password) {
    showStatus("Password ไม่ตรงกัน", "error");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }) // ✅ ส่งแค่ที่ backend ต้องใช้
    });

    const data = await res.json();
    if (res.ok) {
      showStatus("✅ สมัครสมาชิกสำเร็จ!", "success");
      document.querySelector("[data-tab='login']").click();
    } else {
      showStatus("❌ Register fail: " + (data.error || JSON.stringify(data)), "error");
    }
  } catch (err) {
    showStatus("❌ Error: " + err.message, "error");
  }
}


// --- Login ---
async function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!username || !password) {
    showStatus("กรอกข้อมูลให้ครบ", "error");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      showStatus("✅ ยินดีต้อนรับ " + data.user.username, "success");
    } else {
      showStatus("❌ Login fail: " + (data.error || JSON.stringify(data)), "error");
    }
  } catch (err) {
    showStatus("❌ Error: " + err.message, "error");
  }
}

// --- Helper ---
function showStatus(msg, type="success") {
  const el = document.getElementById("status");
  el.style.display = "block";
  el.className = "status-box " + type;
  el.textContent = msg;
}
