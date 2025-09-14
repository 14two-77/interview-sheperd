// SPA: Render Auth (Login/Register) page
function renderAuthPage() {
  return [`
    <div class="min-h-screen flex flex-col items-center justify-center">
 <div class="bg-white rounded-xl shadow-lg w-[500px] p-12 text-center animate-fadeIn">
    <h1 class="text-4xl font-bold text-gray-800 mb-12">AI Interview Webapp</h1>

    <!-- Tabs -->
    <div class="flex border-2 border-gray-300 rounded-lg overflow-hidden mb-6">
      <button class="tab-button flex-1 py-3 bg-blue-900 text-white font-bold" data-tab="login">Login</button>
      <button class="tab-button flex-1 py-3 bg-gray-100 text-gray-700" data-tab="register">Register</button>
    </div>

    <!-- Login -->
    <div id="login" class="tab-content block">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6">Login</h2>
      <div class="relative mb-4">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
        <input type="text" id="login-username" placeholder="Username"
               class="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"/>
      </div>
      <div class="relative mb-4">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
        <input type="password" id="login-password" placeholder="Password"
               class="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"/>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" onclick="togglePassword('login-password', this)">👁</span>
      </div>
      <button onclick="login()"
              class="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 active:scale-95 transition">
        Confirm
      </button>
    </div>

    <!-- Register -->
    <div id="register" class="tab-content hidden">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6">Register</h2>
      <div class="relative mb-4">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
        <input type="text" id="reg-username" placeholder="Username"
               class="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"/>
      </div>
      <div class="relative mb-4">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
        <input type="password" id="reg-password" placeholder="Password"
               class="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"/>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" onclick="togglePassword('reg-password', this)">👁</span>
      </div>
      <div class="relative mb-4">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
        <input type="password" id="reg-confirm-password" placeholder="Confirm password"
               class="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none"/>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400" onclick="togglePassword('reg-confirm-password', this)">👁</span>
      </div>
      <button onclick="register()"
              class=" w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 active:scale-95 transition">
        Confirm
      </button>
    </div>

    <!-- Status -->
    <div id="status" class="hidden mt-4 p-3 rounded text-sm"></div>
  </div>
</div>
  `, () => {
      // ----- Tab switching (Tailwind-aware) -----
      document.querySelectorAll(".tab-button").forEach(btn => {
        btn.addEventListener("click", () => {
          // reset ALL buttons to "inactive" Tailwind classes
          document.querySelectorAll(".tab-button").forEach(b => {
            b.classList.remove('bg-blue-900', 'text-white', 'font-bold');
            b.classList.add('bg-gray-100', 'text-gray-700');
            // optional: ensure focus/outline classes are consistent
            b.classList.remove('ring', 'ring-blue-300');
          });

          // hide all contents
          document.querySelectorAll(".tab-content").forEach(c => {
            c.classList.add('hidden');
            c.classList.remove('block');
          });

          // make clicked button "active"
          btn.classList.remove('bg-gray-100', 'text-gray-700');
          btn.classList.add('bg-blue-900', 'text-white', 'font-bold', 'ring', 'ring-blue-300');

          // show the content for this tab (use block to follow Tailwind display utilities)
          const target = document.getElementById(btn.dataset.tab);
          if (target) {
            target.classList.remove('hidden');
            target.classList.add('block');
          }
        });
      });

      // run on page load: ensure all toggled inputs are hidden and toggles show the eye
      document.querySelectorAll('.toggle-password').forEach(el => {
        // find the related input inside the same .input-group
        const input = el.closest('.input-group')?.querySelector('input');
        if (!input) return;
        // force it to password type
        input.type = 'password';
        // reset toggle icon to eye
        el.textContent = '👁';
      });

      // initialize tabs so UI state and DOM state match
      const activeBtn = document.querySelector('.tab-button.active') || document.querySelector('.tab-button');
      if (activeBtn) activeBtn.click();


      // optional: initialize state on page load so UI matches initial markup
      (function initTabsOnLoad() {
        const activeBtn = document.querySelector('.tab-button.active') || document.querySelector('.tab-button');
        if (activeBtn) activeBtn.click();
      })();
    }];
}
