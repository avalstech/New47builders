(function () {
  const qs = (s, el = document) => el.querySelector(s);

  const state = {
    mode: "login" // "login" | "signup"
  };

  const tabLogin = qs("#tabLogin");
  const tabSignup = qs("#tabSignup");
  const authTitle = qs("#authTitle");
  const authSub = qs("#authSub");
  const nameRow = qs("#nameRow");
  const confirmRow = qs("#confirmRow");
  const submitBtn = qs("#submitBtn");
  const switchNote = qs("#switchNote");
  const switchBtn = qs("#switchBtn");

  const form = qs("#authForm");
  const msgEl = qs("#authMsg");

  const email = qs("#email");
  const password = qs("#password");
  const confirmPassword = qs("#confirmPassword");
  const firstName = qs("#firstName");
  const lastName = qs("#lastName");

  const togglePass = qs("#togglePass");
  const toastEl = qs("#toast");

  const forgotBtn = qs("#forgotBtn");
  const forgotModal = qs("#forgotModal");
  const closeForgot = qs("#closeForgot");
  const cancelForgot = qs("#cancelForgot");
  const forgotForm = qs("#forgotForm");
  const forgotEmail = qs("#forgotEmail");
  const forgotMsg = qs("#forgotMsg");

  const googleBtn = qs("#googleBtn");
  const appleBtn = qs("#appleBtn");

  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (toastEl.hidden = true), 2600);
  }

  function showMsg(type, text) {
    if (!msgEl) return;
    msgEl.classList.remove("ok", "err", "show");
    msgEl.classList.add(type, "show");
    msgEl.textContent = text;
  }

  function showForgotMsg(type, text) {
    if (!forgotMsg) return;
    forgotMsg.classList.remove("ok", "err", "show");
    forgotMsg.classList.add(type, "show");
    forgotMsg.textContent = text;
  }

  function setMode(mode) {
    state.mode = mode;

    const isLogin = mode === "login";
    tabLogin?.classList.toggle("active", isLogin);
    tabSignup?.classList.toggle("active", !isLogin);
    tabLogin?.setAttribute("aria-selected", String(isLogin));
    tabSignup?.setAttribute("aria-selected", String(!isLogin));

    if (authTitle) authTitle.textContent = isLogin ? "Welcome back" : "Create your account";
    if (authSub) authSub.textContent = isLogin ? "Login to continue to your dashboard." : "Sign up to start managing projects.";
    if (submitBtn) submitBtn.textContent = isLogin ? "Login" : "Create account";

    if (nameRow) nameRow.hidden = isLogin;
    if (confirmRow) confirmRow.hidden = isLogin;

    if (switchNote) switchNote.textContent = isLogin ? "New here?" : "Already have an account?";
    if (switchBtn) switchBtn.textContent = isLogin ? "Create an account" : "Login instead";

    showMsg("ok", ""); // clears styling
    msgEl.classList.remove("show");
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  function require(v) {
    return String(v || "").trim().length > 0;
  }

  function minLen(v, n) {
    return String(v || "").length >= n;
  }

  async function apiLogin(payload) {
    // TODO: replace with real backend call
    // return fetch("/api/auth/login", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) })
    //   .then(r => r.ok ? r.json() : Promise.reject(r));
    await new Promise((r) => setTimeout(r, 450));
    return { ok: true, redirectTo: "/dashboard.html" };
  }

  async function apiSignup(payload) {
    // TODO: replace with real backend call
    await new Promise((r) => setTimeout(r, 550));
    return { ok: true, redirectTo: "/dashboard.html" };
  }

  async function apiForgotPassword(payload) {
    // TODO: replace with real backend call
    await new Promise((r) => setTimeout(r, 450));
    return { ok: true };
  }

  tabLogin?.addEventListener("click", () => setMode("login"));
  tabSignup?.addEventListener("click", () => setMode("signup"));
  switchBtn?.addEventListener("click", () => setMode(state.mode === "login" ? "signup" : "login"));

  togglePass?.addEventListener("click", () => {
    const isPass = password.type === "password";
    password.type = isPass ? "text" : "password";
    togglePass.setAttribute("aria-label", isPass ? "Hide password" : "Show password");
    togglePass.textContent = isPass ? "🙈" : "👁️";
  });

  forgotBtn?.addEventListener("click", () => {
    forgotEmail.value = email.value || "";
    showForgotMsg("ok", "");
    forgotMsg.classList.remove("show");
    forgotModal?.showModal();
  });
  closeForgot?.addEventListener("click", () => forgotModal?.close());
  cancelForgot?.addEventListener("click", () => forgotModal?.close());

  forgotForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const v = String(forgotEmail.value || "").trim();
    if (!validEmail(v)) return showForgotMsg("err", "Enter a valid email address.");

    try {
      showForgotMsg("ok", "Sending reset link...");
      await apiForgotPassword({ email: v });
      showForgotMsg("ok", "Reset link sent. Check your inbox.");
      toast("Reset link sent");
    } catch {
      showForgotMsg("err", "Something went wrong. Try again.");
    }
  });

  googleBtn?.addEventListener("click", () => {
    toast("Google sign in (connect to OAuth)");
    console.log("oauth: google");
  });
  appleBtn?.addEventListener("click", () => {
    toast("Apple sign in (connect to OAuth)");
    console.log("oauth: apple");
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      email: String(email.value || "").trim(),
      password: String(password.value || ""),
      remember: !!qs("#remember")?.checked
    };

    if (!validEmail(payload.email)) return showMsg("err", "Enter a valid email address.");
    if (!minLen(payload.password, 8)) return showMsg("err", "Password must be at least 8 characters.");

    if (state.mode === "signup") {
      const fn = String(firstName.value || "").trim();
      const ln = String(lastName.value || "").trim();
      const cp = String(confirmPassword.value || "");

      if (!require(fn) || !require(ln)) return showMsg("err", "Add your first and last name.");
      if (cp !== payload.password) return showMsg("err", "Passwords do not match.");

      const signupPayload = { ...payload, firstName: fn, lastName: ln };

      try {
        showMsg("ok", "Creating account...");
        const res = await apiSignup(signupPayload);
        showMsg("ok", "Account created. Redirecting...");
        toast("Welcome to 47Builders");
        if (res?.redirectTo) window.location.href = res.redirectTo;
      } catch {
        showMsg("err", "Sign up failed. Please try again.");
      }

      return;
    }

    try {
      showMsg("ok", "Signing in...");
      const res = await apiLogin(payload);
      showMsg("ok", "Login successful. Redirecting...");
      toast("Logged in");
      if (res?.redirectTo) window.location.href = res.redirectTo;
    } catch {
      showMsg("err", "Login failed. Check your details and try again.");
    }
  });

  setMode("login");
})();