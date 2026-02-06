(function () {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const state = {
    user: { name: "Ayo the Tiler", verified: true },
    locationOn: false,
    invites: [],
    jobs: [],
    threads: [],
    activeThreadId: null,
    wallet: {
      balance: 250000,
      pending: 90000,
      month: 410000,
      currency: "NGN"
    },
    project: {
      name: "Lekki Duplex Renovation",
      role: "Tiling and Finishing",
      milestone: "Floor tiling (Phase 2)",
      status: "In progress",
      progress: 62,
      dueDays: 6,
      lastUpdate: "today"
    }
  };

  const formatNaira = (n) => {
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `₦${Number(n || 0).toLocaleString("en-NG")}`;
    }
  };

  const nowTime = () => {
    const d = new Date();
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const toast = (msg) => {
    const el = qs("#toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (el.hidden = true), 2600);
  };

  const topbar = qs("[data-elevate]");
  const onScroll = () => {
    if (!topbar) return;
    topbar.setAttribute("data-scrolled", window.scrollY > 4 ? "true" : "false");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const userName = qs("#userName");
  if (userName) userName.textContent = state.user.name;

  const userMenuBtn = qs("#userMenuBtn");
  const userMenu = qs("#userMenu");
  const setMenu = (open) => {
    if (!userMenuBtn || !userMenu) return;
    userMenu.hidden = !open;
    userMenuBtn.setAttribute("aria-expanded", String(open));
  };
  if (userMenuBtn) {
    userMenuBtn.addEventListener("click", () => setMenu(userMenu.hidden));
  }
  document.addEventListener("click", (e) => {
    if (!userMenuBtn || !userMenu) return;
    const isClickInside = userMenuBtn.contains(e.target) || userMenu.contains(e.target);
    if (!isClickInside) setMenu(false);
  });

  const availabilityDot = qs("#availabilityDot");
  const availabilityText = qs("#availabilityText");
  const availabilityBtn = qs("#availabilityBtn");

  const renderAvailability = () => {
    if (!availabilityDot || !availabilityText) return;
    availabilityDot.style.background = state.locationOn ? "rgba(245,200,76,.95)" : "rgba(255,255,255,.25)";
    availabilityText.textContent = state.locationOn ? "Location: On" : "Location: Off";
  };

  async function toggleLocation() {
    state.locationOn = !state.locationOn;
    renderAvailability();

    if (state.locationOn) {
      toast("Location enabled. You can receive nearby job invites.");
    } else {
      toast("Location disabled.");
    }

    try {
      if (state.locationOn && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const payload = {
              enabled: true,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              at: new Date().toISOString()
            };
            console.log("Location payload:", payload);

            // TODO: send to backend
            // await apiUpdateLocation(payload)
          },
          (err) => {
            console.warn("Geolocation error:", err);
            toast("Location permission denied. Turn it on in your browser settings.");
            state.locationOn = false;
            renderAvailability();
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    } catch (e) {
      console.warn(e);
    }
  }

  if (availabilityBtn) availabilityBtn.addEventListener("click", toggleLocation);
  const btnToggleLocation = qs("#btnToggleLocation");
  if (btnToggleLocation) btnToggleLocation.addEventListener("click", toggleLocation);

  function renderProject() {
    qs("#projName").textContent = state.project.name;
    qs("#projRole").textContent = state.project.role;
    qs("#projMilestone").textContent = state.project.milestone;

    const statusEl = qs("#projStatus");
    if (statusEl) statusEl.textContent = state.project.status;

    const bar = qs("#projBar");
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, state.project.progress))}%`;

    const meta = qs("#projMeta");
    if (meta) meta.textContent = `Due in ${state.project.dueDays} days · Last update: ${state.project.lastUpdate}`;
  }

  function renderWallet() {
    qs("#walletBalance").textContent = formatNaira(state.wallet.balance);
    qs("#walletPending").textContent = formatNaira(state.wallet.pending);
    qs("#walletMonth").textContent = formatNaira(state.wallet.month);
  }

  function renderBadges() {
    const invitesBadge = qs("#invitesBadge");
    const messagesBadge = qs("#messagesBadge");

    const invitesUnread = state.invites.filter((i) => !i.read).length;
    const messagesUnread = state.threads.reduce((sum, t) => sum + (t.unread || 0), 0);

    if (invitesBadge) invitesBadge.textContent = String(invitesUnread);
    if (messagesBadge) messagesBadge.textContent = String(messagesUnread);
  }

  function itemCard({ title, meta, pills = [], ctaText, onCta, secondaryText, onSecondary }) {
    const wrap = document.createElement("div");
    wrap.className = "item";

    const left = document.createElement("div");
    left.className = "itemLeft";
    const h = document.createElement("div");
    h.className = "itemTitle";
    h.textContent = title;

    const m = document.createElement("div");
    m.className = "itemMeta";
    m.textContent = meta;

    const pillsEl = document.createElement("div");
    pillsEl.className = "pills";
    pills.forEach((p) => {
      const s = document.createElement("span");
      s.className = "pill";
      s.textContent = p;
      pillsEl.appendChild(s);
    });

    left.appendChild(h);
    left.appendChild(m);
    if (pills.length) left.appendChild(pillsEl);

    const right = document.createElement("div");
    right.className = "itemRight";

    if (ctaText) {
      const b = document.createElement("button");
      b.className = "btn small primary";
      b.type = "button";
      b.textContent = ctaText;
      b.addEventListener("click", onCta);
      right.appendChild(b);
    }

    if (secondaryText) {
      const b2 = document.createElement("button");
      b2.className = "btn small";
      b2.type = "button";
      b2.textContent = secondaryText;
      b2.addEventListener("click", onSecondary);
      right.appendChild(b2);
    }

    wrap.appendChild(left);
    wrap.appendChild(right);
    return wrap;
  }

  function renderJobs(list = state.jobs) {
    const el = qs("#jobsList");
    if (!el) return;
    el.innerHTML = "";

    if (!list.length) {
      el.appendChild(itemCard({
        title: "No jobs found",
        meta: "Try changing your filters or turn location on for nearby invites.",
        ctaText: "Turn location on",
        onCta: toggleLocation
      }));
      return;
    }

    list.forEach((job) => {
      el.appendChild(itemCard({
        title: job.title,
        meta: `${job.city} · Budget: ${job.budget} · Start: ${job.start}`,
        pills: [job.skill, job.type],
        ctaText: "Apply",
        onCta: () => {
          toast(`Applied to: ${job.title}`);
          console.log("apply payload", { jobId: job.id });
          // TODO: apiApply(job.id)
        },
        secondaryText: "View",
        onSecondary: () => {
          toast("Job details opened");
          console.log("open job", job.id);
        }
      }));
    });
  }

  function renderInvites() {
    const el = qs("#invitesList");
    if (!el) return;
    el.innerHTML = "";

    if (!state.invites.length) {
      el.appendChild(itemCard({
        title: "No invites yet",
        meta: "Keep your profile updated and location on to receive job invites.",
        ctaText: "Find jobs",
        onCta: () => {
          window.location.hash = "#jobs";
          toast("Showing job search");
        }
      }));
      return;
    }

    state.invites.forEach((inv) => {
      el.appendChild(itemCard({
        title: inv.title,
        meta: `${inv.city} · Budget: ${inv.budget} · Sent: ${inv.sent}`,
        pills: [inv.skill, inv.urgency],
        ctaText: "Accept",
        onCta: () => {
          inv.read = true;
          toast(`Invite accepted: ${inv.title}`);
          renderBadges();
          console.log("accept invite", inv.id);
          // TODO: apiAcceptInvite(inv.id)
        },
        secondaryText: "Decline",
        onSecondary: () => {
          inv.read = true;
          toast(`Invite declined: ${inv.title}`);
          renderBadges();
          console.log("decline invite", inv.id);
        }
      }));
    });
  }

  function renderThreads(filterText = "") {
    const el = qs("#threads");
    if (!el) return;
    el.innerHTML = "";

    const list = state.threads.filter((t) => {
      if (!filterText) return true;
      const x = filterText.toLowerCase();
      return (t.title + " " + t.last).toLowerCase().includes(x);
    });

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "mutedSmall";
      empty.textContent = "No conversations found.";
      el.appendChild(empty);
      return;
    }

    list.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "thread" + (t.id === state.activeThreadId ? " active" : "");
      btn.innerHTML = `
        <div style="min-width:0">
          <div class="threadTitle">${escapeHtml(t.title)}</div>
          <div class="threadSnippet">${escapeHtml(t.last)}</div>
        </div>
        ${t.unread ? `<div class="threadBadge">${t.unread}</div>` : `<div style="width:20px"></div>`}
      `;
      btn.addEventListener("click", () => openThread(t.id));
      el.appendChild(btn);
    });
  }

  function renderChat() {
    const titleEl = qs("#chatTitle");
    const bodyEl = qs("#chatBody");
    const sendBtn = qs("#sendBtn");
    const openJobBtn = qs("#openJobBtn");

    if (!titleEl || !bodyEl || !sendBtn || !openJobBtn) return;

    const t = state.threads.find((x) => x.id === state.activeThreadId);
    if (!t) {
      titleEl.textContent = "Select a conversation";
      bodyEl.innerHTML = `<div class="mutedSmall">Choose a thread on the left to see messages.</div>`;
      sendBtn.disabled = true;
      openJobBtn.disabled = true;
      return;
    }

    titleEl.textContent = t.title;
    sendBtn.disabled = false;
    openJobBtn.disabled = !t.jobId;

    bodyEl.innerHTML = "";
    t.messages.forEach((msg) => {
      const div = document.createElement("div");
      div.className = "bubble" + (msg.me ? " me" : "");
      div.innerHTML = `${escapeHtml(msg.text)}<span class="time">${escapeHtml(msg.time)}</span>`;
      bodyEl.appendChild(div);
    });

    bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  function openThread(id) {
    state.activeThreadId = id;
    const t = state.threads.find((x) => x.id === id);
    if (t) t.unread = 0;
    renderBadges();
    renderThreads(qs("#messageSearch")?.value || "");
    renderChat();
  }

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  const jobSearchForm = qs("#jobSearchForm");
  if (jobSearchForm) {
    jobSearchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const skill = qs("#skillSelect").value;
      const city = qs("#citySelect").value;
      const budget = qs("#budgetSelect").value;

      const filtered = state.jobs.filter((j) => {
        const okSkill = skill === "all" ? true : j.skillKey === skill;
        const okCity = city ? j.cityKey === city : true;
        const okBudget = budget === "all" ? true : j.budgetKey === budget;
        return okSkill && okCity && okBudget;
      });

      renderJobs(filtered);
      toast(`${filtered.length} job(s) found`);
    });
  }

  const refreshBtn = qs("#refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      toast("Refreshed");
      hydrateDemoData(true);
      renderAll();
    });
  }

  const findJobsBtn = qs("#findJobsBtn");
  if (findJobsBtn) {
    findJobsBtn.addEventListener("click", () => {
      window.location.hash = "#jobs";
      toast("Showing job search");
    });
  }

  const markInvitesReadBtn = qs("#markInvitesReadBtn");
  if (markInvitesReadBtn) {
    markInvitesReadBtn.addEventListener("click", () => {
      state.invites.forEach((i) => (i.read = true));
      toast("Invites marked as read");
      renderBadges();
      renderInvites();
    });
  }

  const messageSearch = qs("#messageSearch");
  if (messageSearch) {
    messageSearch.addEventListener("input", (e) => {
      renderThreads(e.target.value);
    });
  }

  const chatForm = qs("#chatForm");
  const chatInput = qs("#chatInput");
  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const t = state.threads.find((x) => x.id === state.activeThreadId);
      const text = String(chatInput.value || "").trim();
      if (!t || !text) return;

      t.messages.push({ me: true, text, time: nowTime() });
      t.last = text;
      chatInput.value = "";

      renderThreads(messageSearch?.value || "");
      renderChat();

      console.log("send message payload", { threadId: t.id, text });
      // TODO: apiSendMessage(t.id, text)
    });
  }

  const openJobBtn = qs("#openJobBtn");
  if (openJobBtn) {
    openJobBtn.addEventListener("click", () => {
      const t = state.threads.find((x) => x.id === state.activeThreadId);
      if (!t?.jobId) return;
      toast("Job details opened");
      console.log("open job from thread", t.jobId);
    });
  }

  const statusModal = qs("#statusModal");
  const btnUpdateStatus = qs("#btnUpdateStatus");
  const postUpdateBtn = qs("#postUpdateBtn");
  const editProjectBtn = qs("#editProjectBtn");
  const closeStatusModal = qs("#closeStatusModal");
  const cancelStatus = qs("#cancelStatus");

  const openStatusModal = () => {
    if (!statusModal) return;
    qs("#statusSelect").value = state.project.status;
    qs("#progressInput").value = String(state.project.progress);
    qs("#noteInput").value = "";
    statusModal.showModal();
  };

  const closeModal = () => {
    if (!statusModal) return;
    statusModal.close();
  };

  if (btnUpdateStatus) btnUpdateStatus.addEventListener("click", openStatusModal);
  if (postUpdateBtn) postUpdateBtn.addEventListener("click", openStatusModal);
  if (editProjectBtn) editProjectBtn.addEventListener("click", openStatusModal);
  if (closeStatusModal) closeStatusModal.addEventListener("click", closeModal);
  if (cancelStatus) cancelStatus.addEventListener("click", closeModal);

  const statusForm = qs("#statusForm");
  if (statusForm) {
    statusForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = qs("#statusSelect").value;
      const progress = Number(qs("#progressInput").value);
      const note = String(qs("#noteInput").value || "").trim();

      state.project.status = status;
      state.project.progress = isFinite(progress) ? Math.max(0, Math.min(100, progress)) : state.project.progress;
      state.project.lastUpdate = "just now";

      renderProject();
      toast("Project status updated");
      console.log("status update payload", { status, progress: state.project.progress, note });

      closeModal();
      // TODO: apiPostProjectUpdate({ status, progress, note })
    });
  }

  const sideNavLinks = qsa(".sideNav a");
  function setActiveNavByHash() {
    const hash = window.location.hash || "#overview";
    sideNavLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === hash));
  }
  window.addEventListener("hashchange", setActiveNavByHash);
  setActiveNavByHash();

  function hydrateDemoData(refreshed = false) {
    state.jobs = [
      { id: "j1", title: "Tiling for 2-bedroom apartment", city: "Lekki, Lagos", cityKey: "lagos", budget: "₦220,000", budgetKey: "mid", skill: "Tiling", skillKey: "tiling", type: "On-site", start: "In 3 days" },
      { id: "j2", title: "Bathroom and kitchen tiling", city: "Yaba, Lagos", cityKey: "lagos", budget: "₦180,000", budgetKey: "mid", skill: "Tiling", skillKey: "tiling", type: "On-site", start: "This week" },
      { id: "j3", title: "Floor finishing (tiles + grout)", city: "GRA, Port Harcourt", cityKey: "ph", budget: "₦650,000", budgetKey: "high", skill: "Tiling", skillKey: "tiling", type: "On-site", start: "Next week" }
    ];

    state.invites = [
      { id: "i1", title: "Urgent: Tiling touch-ups and corrections", city: "Ajah, Lagos", budget: "₦120,000", skill: "Tiling", urgency: "Urgent", sent: refreshed ? "just now" : "yesterday", read: false },
      { id: "i2", title: "Site visit for measurement and quote", city: "Benin City", budget: "₦60,000", skill: "Tiling", urgency: "Normal", sent: refreshed ? "just now" : "2 days ago", read: false }
    ];

    state.threads = [
      {
        id: "t1",
        title: "Client: Chioma (Lekki Duplex)",
        last: "Please confirm your availability for inspection.",
        unread: refreshed ? 1 : 2,
        jobId: "j1",
        messages: [
          { me: false, text: "Hello, can you start Phase 2 this week?", time: "09:12" },
          { me: true, text: "Yes, I can. Please share the exact site address.", time: "09:20" },
          { me: false, text: "Please confirm your availability for inspection.", time: "10:02" }
        ]
      },
      {
        id: "t2",
        title: "47Builders Ops",
        last: "Upload 3 portfolio images for verification.",
        unread: refreshed ? 0 : 1,
        jobId: null,
        messages: [
          { me: false, text: "Upload 3 portfolio images for verification.", time: "Yesterday" },
          { me: true, text: "Done. Please confirm if it is approved.", time: "Yesterday" }
        ]
      }
    ];

    state.wallet.balance = refreshed ? 265000 : 250000;
    state.wallet.pending = 90000;
    state.wallet.month = refreshed ? 430000 : 410000;
  }

  function renderAll() {
    renderAvailability();
    renderProject();
    renderWallet();
    renderJobs(state.jobs);
    renderInvites();
    renderBadges();
    renderThreads(qs("#messageSearch")?.value || "");
    renderChat();
  }

  hydrateDemoData(false);
  renderAll();
})();