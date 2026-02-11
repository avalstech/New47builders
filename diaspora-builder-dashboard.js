(function () {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  const state = {
    user: { name: "Victor (Diaspora Owner)", role: "Owner", timezone: "GMT" },
    wallet: { balance: 1250000, pending: 240000, month: 1810000, currency: "NGN" },
    activeProjectId: "p1",
    projects: {
      p1: {
        id: "p1",
        name: "Lekki Duplex Renovation",
        country: "Nigeria",
        builder: "47Builders Verified Team",
        milestone: "Floor tiling (Phase 2)",
        status: "In progress",
        progress: 62,
        dueDays: 6,
        lastUpdate: "today",
        timeline: [
          { at: "2 weeks ago", title: "Foundation inspection completed", note: "Photo evidence uploaded." },
          { at: "1 week ago", title: "Electrical first fix completed", note: "QC passed." },
          { at: "today", title: "Floor tiling in progress", note: "Phase 2 underway." }
        ]
      },
      p2: {
        id: "p2",
        name: "Abuja 4-Bed Bungalow",
        country: "Nigeria",
        builder: "Assigned Supervisor",
        milestone: "Roofing materials delivery",
        status: "Blocked",
        progress: 35,
        dueDays: 10,
        lastUpdate: "yesterday",
        timeline: [
          { at: "3 weeks ago", title: "Setting out completed", note: "Marked lines and site prep." },
          { at: "1 week ago", title: "Blocks delivery", note: "Delivered and verified." },
          { at: "yesterday", title: "Roofing delayed", note: "Supplier issue pending." }
        ]
      },
      p3: {
        id: "p3",
        name: "Enugu Extension Build",
        country: "Nigeria",
        builder: "47Builders Partner Builder",
        milestone: "Plastering (external)",
        status: "Not started",
        progress: 0,
        dueDays: 18,
        lastUpdate: "3 days ago",
        timeline: [
          { at: "3 days ago", title: "Project created", note: "Awaiting mobilisation." }
        ]
      }
    },
    postedJobs: [],
    talent: [],
    threads: [],
    activeThreadId: null,
    releases: [],
    live: { connected: false, shareUrl: "https://47builders.uk/live/secure-demo-link" }
  };

  const formatNaira = (n) => {
    try {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `₦${Number(n || 0).toLocaleString("en-NG")}`;
    }
  };

  const nowTime = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

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
  const userRole = qs("#userRole");
  if (userName) userName.textContent = state.user.name;
  if (userRole) userRole.textContent = state.user.role;

  const tzText = qs("#tzText");
  if (tzText) tzText.textContent = `Timezone: ${state.user.timezone}`;

  const userMenuBtn = qs("#userMenuBtn");
  const userMenu = qs("#userMenu");
  const setMenu = (open) => {
    if (!userMenuBtn || !userMenu) return;
    userMenu.hidden = !open;
    userMenuBtn.setAttribute("aria-expanded", String(open));
  };
  userMenuBtn?.addEventListener("click", () => setMenu(userMenu.hidden));
  document.addEventListener("click", (e) => {
    if (!userMenuBtn || !userMenu) return;
    const inside = userMenuBtn.contains(e.target) || userMenu.contains(e.target);
    if (!inside) setMenu(false);
  });

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showMsg(el, type, text) {
    if (!el) return;
    el.classList.remove("ok", "err", "show");
    el.classList.add(type, "show");
    el.textContent = text;
  }

  function getActiveProject() {
    return state.projects[state.activeProjectId];
  }

  function renderProjectPicker() {
    const select = qs("#projectSelect");
    const activeName = qs("#activeProjectName");
    const activeMeta = qs("#activeProjectMeta");
    if (!select) return;

    select.value = state.activeProjectId;

    const p = getActiveProject();
    if (activeName) activeName.textContent = p.name;
    if (activeMeta) activeMeta.textContent = `Client-managed · ${p.country}`;
  }

  function renderProject() {
    const p = getActiveProject();
    qs("#projName").textContent = p.name;
    qs("#projBuilder").textContent = p.builder;
    qs("#projMilestone").textContent = p.milestone;
    qs("#projStatus").textContent = p.status;
    qs("#projBar").style.width = `${Math.max(0, Math.min(100, p.progress))}%`;
    qs("#projMeta").textContent = `Due in ${p.dueDays} days · Last update: ${p.lastUpdate}`;
  }

  function renderWallet() {
    qs("#walletBalance").textContent = formatNaira(state.wallet.balance);
    qs("#walletPending").textContent = formatNaira(state.wallet.pending);
    qs("#walletMonth").textContent = formatNaira(state.wallet.month);
  }

  function renderMessagesBadge() {
    const messagesBadge = qs("#messagesBadge");
    const unread = state.threads.reduce((sum, t) => sum + (t.unread || 0), 0);
    if (messagesBadge) messagesBadge.textContent = String(unread);
  }

  function renderPostedJobs() {
    const el = qs("#postedJobsList");
    if (!el) return;
    el.innerHTML = "";

    if (!state.postedJobs.length) {
      el.innerHTML = `<div class="mutedSmall">No jobs posted yet. Use the form above to post one.</div>`;
      return;
    }

    state.postedJobs.slice().reverse().forEach((j) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="itemLeft">
          <div class="itemTitle">${escapeHtml(j.title)}</div>
          <div class="itemMeta">${escapeHtml(j.cityLabel)} · Budget: ${formatNaira(j.budget)} · Release: ${escapeHtml(j.release)}</div>
          <div class="pills">
            <span class="pill">${escapeHtml(j.skillLabel)}</span>
            <span class="pill">Start: ${escapeHtml(j.startDate)}</span>
          </div>
        </div>
        <div class="itemRight">
          <button class="btn small primary" type="button">Invite talent</button>
          <button class="btn small" type="button">Close</button>
        </div>
      `;

      const [inviteBtn, closeBtn] = qsa("button", div);

      inviteBtn.addEventListener("click", () => {
        toast("Invites sent (demo)");
        console.log("invite talent payload", { jobId: j.id });
      });

      closeBtn.addEventListener("click", () => {
        j.closed = true;
        toast("Job closed (demo)");
        div.style.opacity = "0.55";
      });

      el.appendChild(div);
    });
  }

  function talentCard(t) {
    const wrap = document.createElement("div");
    wrap.className = "item";

    wrap.innerHTML = `
      <div class="itemLeft">
        <div class="itemTitle">${escapeHtml(t.name)} · ${escapeHtml(t.skill)}</div>
        <div class="itemMeta">${escapeHtml(t.city)} · Rating: ${t.rating} · Completed: ${t.completed}</div>
        <div class="pills">
          ${t.verified ? `<span class="pill verified">Verified</span>` : `<span class="pill">Unverified</span>`}
          <span class="pill">${escapeHtml(t.availability)}</span>
          <span class="pill">${escapeHtml(t.rate)}</span>
        </div>
      </div>
      <div class="itemRight">
        <button class="btn small primary" type="button">Hire</button>
        <button class="btn small" type="button">Message</button>
      </div>
    `;

    const [hireBtn, msgBtn] = qsa("button", wrap);

    hireBtn.addEventListener("click", () => {
      qs("#hireTalentMeta").textContent = `Hiring ${t.name} (${t.skill}) in ${t.city}`;
      qs("#offerAmount").value = "";
      qs("#hireMessage").value = "";
      wrap._talent = t;
      qs("#hireModal").showModal();
    });

    msgBtn.addEventListener("click", () => {
      toast("Message thread opened (demo)");
      openThread("t1");
    });

    return wrap;
  }

  function renderTalent(list = state.talent) {
    const el = qs("#talentList");
    if (!el) return;
    el.innerHTML = "";

    if (!list.length) {
      el.innerHTML = `<div class="mutedSmall">No talent found. Try refresh.</div>`;
      return;
    }
    list.forEach((t) => el.appendChild(talentCard(t)));
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
      el.innerHTML = `<div class="mutedSmall">No conversations found.</div>`;
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

    const t = state.threads.find((x) => x.id === state.activeThreadId);

    if (!t) {
      titleEl.textContent = "Select a conversation";
      bodyEl.innerHTML = `<div class="mutedSmall">Choose a thread to see messages.</div>`;
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
    renderMessagesBadge();
    renderThreads(qs("#messageSearch")?.value || "");
    renderChat();
  }

  qs("#chatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = state.threads.find((x) => x.id === state.activeThreadId);
    const input = qs("#chatInput");
    const text = String(input?.value || "").trim();
    if (!t || !text) return;

    t.messages.push({ me: true, text, time: nowTime() });
    t.last = text;
    input.value = "";

    renderThreads(qs("#messageSearch")?.value || "");
    renderChat();

    console.log("send message payload", { threadId: t.id, text });
  });

  qs("#messageSearch")?.addEventListener("input", (e) => renderThreads(e.target.value));

  qs("#openJobBtn")?.addEventListener("click", () => {
    const t = state.threads.find((x) => x.id === state.activeThreadId);
    if (!t?.jobId) return;
    toast("Job details opened");
    console.log("open job from thread", t.jobId);
  });

  const statusModal = qs("#statusModal");
  const openStatusModal = () => {
    if (!statusModal) return;
    const p = getActiveProject();
    qs("#statusSelect").value = p.status;
    qs("#progressInput").value = String(p.progress);
    qs("#noteInput").value = "";
    statusModal.showModal();
  };
  const closeStatus = () => statusModal?.close();

  qs("#editProjectBtn")?.addEventListener("click", openStatusModal);
  qs("#closeStatusModal")?.addEventListener("click", closeStatus);
  qs("#cancelStatus")?.addEventListener("click", closeStatus);

  qs("#statusForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = getActiveProject();
    const status = qs("#statusSelect").value;
    const progress = Number(qs("#progressInput").value);
    const note = String(qs("#noteInput").value || "").trim();

    p.status = status;
    p.progress = isFinite(progress) ? Math.max(0, Math.min(100, progress)) : p.progress;
    p.lastUpdate = "just now";

    renderProject();
    toast("Milestone updated (demo)");
    console.log("milestone update payload", { projectId: p.id, status, progress: p.progress, note });

    closeStatus();
  });

  qs("#requestUpdateBtn")?.addEventListener("click", () => {
    toast("Update requested from on-site team (demo)");
    console.log("request update", { projectId: state.activeProjectId });
  });
  qs("#btnRequestUpdate")?.addEventListener("click", () => {
    window.location.hash = "#overview";
    toast("Update requested from on-site team (demo)");
  });

  qs("#approveMilestoneBtn")?.addEventListener("click", () => {
    const p = getActiveProject();
    toast("Milestone approved (demo). Payment can be released.");
    state.releases.unshift({
      id: `rel_${Date.now()}`,
      project: p.name,
      milestone: p.milestone,
      amount: 180000,
      status: "Approved",
      at: "just now"
    });
    renderReleases();
  });

  qs("#postJobForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = qs("#postJobMsg");
    const fd = new FormData(qs("#postJobForm"));
    const payload = Object.fromEntries(fd.entries());

    if (!payload.title || !payload.skill || !payload.city || !payload.budget || !payload.startDate || !payload.release || !payload.desc) {
      showMsg(msg, "err", "Please complete all fields before posting.");
      return;
    }

    const skillLabel = qs('select[name="skill"]').selectedOptions[0].textContent;
    const cityLabel = qs('select[name="city"]').selectedOptions[0].textContent;

    state.postedJobs.push({
      id: `job_${Date.now()}`,
      title: payload.title,
      skill: payload.skill,
      skillLabel,
      city: payload.city,
      cityLabel,
      budget: Number(payload.budget),
      startDate: payload.startDate,
      release: payload.release,
      desc: payload.desc,
      closed: false
    });

    showMsg(msg, "ok", "Job posted. Matching verified talent will be notified (demo).");
    toast("Job posted");
    console.log("post job payload", payload);

    qs("#postJobForm").reset();
    renderPostedJobs();
  });

  qs("#fundForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = qs("#fundMsg");
    const amount = Number(qs("#fundAmount").value);
    const method = qs("#fundMethod").value;

    if (!isFinite(amount) || amount < 1000) {
      showMsg(msg, "err", "Enter a valid amount (minimum ₦1,000).");
      return;
    }
    if (!method) {
      showMsg(msg, "err", "Select a payment method.");
      return;
    }

    state.wallet.balance += amount;
    state.wallet.month += amount;
    renderWallet();

    showMsg(msg, "ok", `Funding initiated via ${method}. Balance updated for demo.`);
    toast("Account funded");
    console.log("fund payload", { amount, method });
    qs("#fundForm").reset();
  });

  function renderReleases() {
    const el = qs("#releasesList");
    if (!el) return;
    el.innerHTML = "";

    if (!state.releases.length) {
      el.innerHTML = `<div class="mutedSmall">No releases yet.</div>`;
      return;
    }

    state.releases.forEach((r) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="itemLeft">
          <div class="itemTitle">${escapeHtml(r.project)} · ${escapeHtml(r.milestone)}</div>
          <div class="itemMeta">Amount: ${formatNaira(r.amount)} · Status: ${escapeHtml(r.status)} · ${escapeHtml(r.at)}</div>
        </div>
        <div class="itemRight">
          <button class="btn small primary" type="button">Release</button>
          <button class="btn small" type="button">Hold</button>
        </div>
      `;
      const [releaseBtn, holdBtn] = qsa("button", div);

      releaseBtn.addEventListener("click", () => {
        if (state.wallet.balance < r.amount) {
          toast("Insufficient balance (demo)");
          return;
        }
        state.wallet.balance -= r.amount;
        r.status = "Released";
        r.at = "just now";
        renderWallet();
        renderReleases();
        toast("Payment released (demo)");
        console.log("release payment", r);
      });

      holdBtn.addEventListener("click", () => {
        r.status = "On hold";
        r.at = "just now";
        renderReleases();
        toast("Payment put on hold (demo)");
      });

      el.appendChild(div);
    });
  }

  qs("#verifyFilter")?.addEventListener("change", () => {
    const v = qs("#verifyFilter").value;
    const q = String(qs("#talentSearch")?.value || "").toLowerCase();
    const filtered = state.talent.filter((t) => {
      const okVerify = v === "all" ? true : t.verified;
      const okSearch = !q ? true : (t.name + " " + t.skill).toLowerCase().includes(q);
      return okVerify && okSearch;
    });
    renderTalent(filtered);
  });

  qs("#talentSearch")?.addEventListener("input", (e) => {
    const q = String(e.target.value || "").toLowerCase();
    const v = qs("#verifyFilter").value;
    const filtered = state.talent.filter((t) => {
      const okVerify = v === "all" ? true : t.verified;
      const okSearch = !q ? true : (t.name + " " + t.skill).toLowerCase().includes(q);
      return okVerify && okSearch;
    });
    renderTalent(filtered);
  });

  qs("#refreshTalentBtn")?.addEventListener("click", () => {
    hydrateDemoData(true);
    renderTalent(state.talent);
    toast("Talent refreshed");
  });

  qs("#hireForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const offer = Number(qs("#offerAmount").value);
    const message = String(qs("#hireMessage").value || "").trim();
    if (!isFinite(offer) || offer <= 0) return toast("Enter a valid offer amount");
    if (!message) return toast("Add a short message");

    const modal = qs("#hireModal");
    modal.close();
    toast("Hire request sent (demo)");
    console.log("hire request", { offer, message });
  });

  qs("#closeHireModal")?.addEventListener("click", () => qs("#hireModal")?.close());
  qs("#cancelHire")?.addEventListener("click", () => qs("#hireModal")?.close());

  const liveModal = qs("#liveModal");
  const openLive = () => liveModal?.showModal();
  const closeLive = () => liveModal?.close();

  qs("#siteViewBtn")?.addEventListener("click", openLive);
  qs("#openLiveBtn")?.addEventListener("click", openLive);
  qs("#openLiveFullBtn")?.addEventListener("click", openLive);
  qs("#closeLiveModal")?.addEventListener("click", closeLive);

  const startDemoLive = () => {
    state.live.connected = true;
    const html = `<div><strong>Demo live stream</strong><div class="mutedSmall">Replace with real feed embed (IVS/WebRTC).</div></div>`;
    qs("#livePreview").innerHTML = html;
    qs("#liveFrame").innerHTML = html;
    toast("Demo live started");
  };
  qs("#startDemoLiveBtn")?.addEventListener("click", startDemoLive);
  qs("#startDemoLiveBtn2")?.addEventListener("click", startDemoLive);

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Link copied");
    } catch {
      toast("Copy failed. Your browser blocked it.");
    }
  }
  qs("#shareLiveBtn")?.addEventListener("click", () => copyText(state.live.shareUrl));
  qs("#copyLiveLinkBtn")?.addEventListener("click", () => copyText(state.live.shareUrl));

  qs("#viewTimelineBtn")?.addEventListener("click", () => {
    const p = getActiveProject();
    const el = qs("#timeline");
    el.innerHTML = "";
    p.timeline.forEach((t) => {
      const row = document.createElement("div");
      row.className = "tItem";
      row.innerHTML = `
        <div class="tDot" aria-hidden="true"></div>
        <div style="min-width:0">
          <div class="itemTitle">${escapeHtml(t.title)}</div>
          <div class="itemMeta">${escapeHtml(t.at)} · ${escapeHtml(t.note)}</div>
        </div>
      `;
      el.appendChild(row);
    });
    qs("#timelineModal").showModal();
  });

  qs("#closeTimelineModal")?.addEventListener("click", () => qs("#timelineModal")?.close());
  qs("#closeTimelineBtn")?.addEventListener("click", () => qs("#timelineModal")?.close());

  qs("#projectSelect")?.addEventListener("change", (e) => {
    state.activeProjectId = e.target.value;
    renderProjectPicker();
    renderProject();
    toast("Project switched");
  });

  qs("#addProjectBtn")?.addEventListener("click", () => {
    toast("Add project flow (demo)");
  });

  const sideNavLinks = qsa(".sideNav a");
  function setActiveNavByHash() {
    const hash = window.location.hash || "#overview";
    sideNavLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === hash));
  }
  window.addEventListener("hashchange", setActiveNavByHash);
  setActiveNavByHash();

  qs("#btnPostJob")?.addEventListener("click", () => (window.location.hash = "#post-job"));
  qs("#btnHireTalent")?.addEventListener("click", () => (window.location.hash = "#hire"));
  qs("#btnFundAccount")?.addEventListener("click", () => (window.location.hash = "#fund"));
  qs("#fundFromWalletBtn")?.addEventListener("click", () => (window.location.hash = "#fund"));

  qs("#refreshBtn")?.addEventListener("click", () => {
    hydrateDemoData(true);
    renderAll();
    toast("Refreshed");
  });

  function hydrateDemoData(refreshed = false) {
    state.talent = [
      { id: "a1", name: "Chinedu", skill: "Tiling", city: "Lagos", rating: 4.7, completed: 18, availability: "Available", rate: "₦50k/day", verified: true },
      { id: "a2", name: "Maryann", skill: "Painting", city: "Lagos", rating: 4.5, completed: 22, availability: "Available", rate: "₦45k/day", verified: true },
      { id: "a3", name: "Ibrahim", skill: "Plumbing", city: "Port Harcourt", rating: 4.6, completed: 15, availability: "Busy", rate: "₦60k/day", verified: false }
    ];

    state.threads = [
      {
        id: "t1",
        title: "On-site Supervisor (Lekki)",
        last: "We uploaded today’s progress video.",
        unread: refreshed ? 1 : 2,
        jobId: "job-demo-1",
        messages: [
          { me: false, text: "We uploaded today’s progress video.", time: "09:12" },
          { me: true, text: "Received. Please confirm tile spacing and grout brand.", time: "09:20" },
          { me: false, text: "Confirmed. Using 3mm spacers. Grout: Weber.", time: "10:02" }
        ]
      },
      {
        id: "t2",
        title: "47Builders Ops",
        last: "Milestone photos approved. You can release payment.",
        unread: refreshed ? 0 : 1,
        jobId: null,
        messages: [
          { me: false, text: "Milestone photos approved. You can release payment.", time: "Yesterday" },
          { me: true, text: "Great. I will release now.", time: "Yesterday" }
        ]
      }
    ];

    state.releases = refreshed
      ? [{ id: "rel_seed", project: "Lekki Duplex Renovation", milestone: "Electrical first fix", amount: 120000, status: "Approved", at: "just now" }]
      : [{ id: "rel_seed", project: "Lekki Duplex Renovation", milestone: "Electrical first fix", amount: 120000, status: "Approved", at: "2 days ago" }];

    if (refreshed) {
      state.wallet.balance += 50000;
      state.wallet.month += 50000;
    }
  }

  function renderAll() {
    renderProjectPicker();
    renderProject();
    renderWallet();
    renderPostedJobs();
    renderTalent(state.talent);
    renderMessagesBadge();
    renderThreads(qs("#messageSearch")?.value || "");
    renderChat();
    renderReleases();
  }

  hydrateDemoData(false);
  renderAll();
})();