// --- Register ---
async function register() {
  // TODO: complete register
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
    const res = await fetch(`${API_BASE_URL}/register`, {
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
  saveUser({ username: "abd" })
  navigate("/job-post")
  return
  // TODO: complete login
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!username || !password) {
    showStatus("กรอกข้อมูลให้ครบ", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
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

// ----- Password toggle (keeps your icon change) -----
function togglePassword(id, el) {
  const input = document.getElementById(id);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    el.textContent = "🙈"; // changed icon
  } else {
    input.type = "password";
    el.textContent = "👁"; // back to eye
  }
}


// ----- showStatus using Tailwind classes -----
function showStatus(msg, type = "success") {
  const el = document.getElementById("status");
  if (!el) return;

  // clear existing TW classes we might have added previously
  el.classList.remove(
    // success
    'bg-green-100', 'text-green-700',
    // error
    'bg-red-100', 'text-red-700',
    // info / blue
    'bg-blue-100', 'text-blue-700'
  );

  // shared layout classes
  el.classList.add('mt-4', 'p-3', 'rounded', 'text-sm', 'block');

  // type-specific classes
  if (type === 'success') {
    el.classList.add('bg-green-100', 'text-green-700');
  } else if (type === 'error') {
    el.classList.add('bg-red-100', 'text-red-700');
  } else {
    el.classList.add('bg-blue-100', 'text-blue-700');
  }

  el.textContent = msg;
  // optionally auto-hide
  if (el._hideTimer) clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.classList.remove('block');
    el.classList.add('hidden');
  }, 3500);
}