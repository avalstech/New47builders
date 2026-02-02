// script.js

// Smooth scroll for internal links
document.addEventListener("click", function (e) {
  const target = e.target;
  if (target.tagName === "A" && target.getAttribute("href")?.startsWith("#")) {
    const id = target.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      window.scrollTo({
        top: el.offsetTop - 60,
        behavior: "smooth",
      });
    }
  }
});

// Simple contact form handler placeholder
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    formMessage.textContent =
      "Thank you. Your project details have been received. A 47Builders specialist will contact you shortly.";
    contactForm.reset();
  });
}

// Chatbot toggle logic
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWidget = document.getElementById("chatbotWidget");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotBody = document.querySelector(".chatbot-body");

function openChatbot() {
  if (!chatbotWidget) return;
  chatbotWidget.style.display = "flex";
  chatbotWidget.setAttribute("aria-hidden", "false");
}

function closeChatbot() {
  if (!chatbotWidget) return;
  chatbotWidget.style.display = "none";
  chatbotWidget.setAttribute("aria-hidden", "true");
}

if (chatbotToggle) {
  chatbotToggle.addEventListener("click", function () {
    if (!chatbotWidget) return;
    const visible = chatbotWidget.style.display === "flex";
    if (visible) {
      closeChatbot();
    } else {
      openChatbot();
    }
  });
}

if (chatbotClose) {
  chatbotClose.addEventListener("click", function () {
    closeChatbot();
  });
}

// Simple mock reply for chatbot placeholder
if (chatbotForm && chatbotInput && chatbotBody) {
  chatbotForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = chatbotInput.value.trim();
    if (!text) return;

    const userMsg = document.createElement("p");
    userMsg.className = "chatbot-message";
    userMsg.textContent = text;
    chatbotBody.appendChild(userMsg);

    const reply = document.createElement("p");
    reply.className = "chatbot-message bot";
    reply.textContent =
      "Thanks for your question. This is a demo AI assistant. In production, I’ll help you match with verified builders, estimate costs, and understand your project options.";
    chatbotBody.appendChild(reply);

    chatbotBody.scrollTop = chatbotBody.scrollHeight;
    chatbotInput.value = "";
  });
}
// MOBILE NAV TOGGLE
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Close nav when clicking a link (mobile)
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});
// ----- ARTISANS DIRECTORY (150 PROFILES + SCROLLING) -----

const artisanGrid = document.getElementById("artisanGrid");
const artisanSearch = document.getElementById("artisanSearch");
const artisanLocationFilter = document.getElementById("artisanLocationFilter");
const artisanSearchBtn = document.getElementById("artisanSearchBtn");

// Base placeholder profiles to rotate
const baseArtisans = [
  { initials: "AP", name: "Ahmed Peter", skill: "Electrician", location: "Lagos", phone: "+2348012345678" },
  { initials: "CJ", name: "Chinyere John", skill: "Carpenter & Furniture Maker", location: "Abuja", phone: "+2348023456789" },
  { initials: "KS", name: "Kunle Samuel", skill: "Plumber", location: "Port Harcourt", phone: "+2348034567890" },
  { initials: "TL", name: "Tunde Lawrence", skill: "Tiler & Finishing Expert", location: "Enugu", phone: "+2348045678901" },
  { initials: "VB", name: "Victor Benson", skill: "Welder / Metal Fabricator", location: "Benin City", phone: "+2348056789012" },
  { initials: "AG", name: "Amina Garba", skill: "Painter & Interior Finisher", location: "Kano", phone: "+2348067890123" }
];

// Build an array of 150 placeholder artisans
const allArtisans = [];
for (let i = 0; i < 150; i++) {
  const base = baseArtisans[i % baseArtisans.length];
  allArtisans.push({
    initials: base.initials,
    name: `${base.name} ${i + 1}`,
    skill: base.skill,
    location: base.location,
    jobs: 40 + ((i * 7) % 90), // random-looking completion count
    phone: base.phone
  });
}

function renderArtisans(list) {
  if (!artisanGrid) return;
  artisanGrid.innerHTML = "";

  list.forEach((a) => {
    const card = document.createElement("div");
    card.className = "artisan-profile";
    card.innerHTML = `
      <div class="avatar">${a.initials}</div>
      <h3>${a.name}</h3>
      <p class="skill">${a.skill}</p>
      <p class="location">${a.location}, Nigeria</p>
      <p class="jobs">Completed ${a.jobs} jobs</p>
      <div class="contact-row">
        <a href="tel:${a.phone}" class="contact-btn">Call</a>
        <a href="https://wa.me/${a.phone.replace(/\+/g, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(a.name)}" 
           class="contact-btn whatsapp" target="_blank">WhatsApp</a>
      </div>
    `;
    artisanGrid.appendChild(card);
  });
}

// Simple search/filter
function filterArtisans() {
  const q = (artisanSearch?.value || "").toLowerCase();
  const loc = artisanLocationFilter?.value || "";

  const filtered = allArtisans.filter((a) => {
    const matchText =
      a.name.toLowerCase().includes(q) ||
      a.skill.toLowerCase().includes(q);
    const matchLoc = !loc || a.location === loc;
    return matchText && matchLoc;
  });

  renderArtisans(filtered);
}

// initial render
if (artisanGrid) {
  renderArtisans(allArtisans);
}

// bind events
if (artisanSearchBtn) {
  artisanSearchBtn.addEventListener("click", filterArtisans);
}
if (artisanSearch) {
  artisanSearch.addEventListener("keyup", function (e) {
    if (e.key === "Enter") filterArtisans();
  });
}
if (artisanLocationFilter) {
  artisanLocationFilter.addEventListener("change", filterArtisans);
}
// Artisan signup form handler (placeholder)

const artisanSignupForm = document.getElementById("artisanSignupForm");
const artisanSignupMessage = document.getElementById("artisanSignupMessage");

if (artisanSignupForm && artisanSignupMessage) {
  artisanSignupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    artisanSignupMessage.textContent =
      "Thank you. Your application has been submitted. Our verification team will contact you within 24 to 72 hours.";
    artisanSignupMessage.style.color = "#fbbf24";

    artisanSignupForm.reset();
  });
}
