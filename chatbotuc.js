// chatbot.js
(function () {
  const openBtn = document.getElementById("openChat");
  const closeBtn = document.getElementById("closeChat");
  const chatbot = document.getElementById("chatbot");
  const chatBody = document.getElementById("chatBody");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  function setOpen(isOpen) {
    chatbot.classList.toggle("open", isOpen);
    chatbot.setAttribute("aria-hidden", String(!isOpen));
    if (isOpen) {
      setTimeout(() => chatInput.focus(), 50);
    }
  }

  function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function botReply(userText) {
    const msg = userText.toLowerCase();

    if (msg.includes("price") || msg.includes("cost")) {
      return "Share what you need and your location, and we’ll give you a quick estimate. You can also message us on WhatsApp for faster response.";
    }
    if (msg.includes("hello") || msg.includes("hi")) {
      return "Hi there. How can I help today?";
    }
    if (msg.includes("contact") || msg.includes("whatsapp")) {
      return "You can reach us via WhatsApp using the button on this page. If you prefer a call, use the Call Now button.";
    }
    return "Thanks. Please share a bit more detail (what you need, your location, and timeline).";
  }

  openBtn?.addEventListener("click", () => {
    setOpen(true);
    if (!chatBody.dataset.welcomed) {
      addMessage("Hi, I’m your AI assistant. What do you need help with?", "bot");
      chatBody.dataset.welcomed = "true";
    }
  });

  closeBtn?.addEventListener("click", () => setOpen(false));

  chatForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = (chatInput.value || "").trim();
    if (!text) return;

    addMessage(text, "user");
    chatInput.value = "";

    setTimeout(() => {
      addMessage(botReply(text), "bot");
    }, 350);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatbot.classList.contains("open")) {
      setOpen(false);
    }
  });
})();
