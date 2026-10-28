(() => {
    "use strict";

    const API_URL = "https://portfolio-ai-chatbot.rsourabh041.workers.dev/api/chat";

    function initializeChatbot() {
        if (document.getElementById("ai-chatbot")) return;

        const root = document.createElement("div");
        root.id = "ai-chatbot";
        root.innerHTML = `
            <button type="button" class="ai-chat-launcher" aria-label="Open portfolio AI chat" aria-expanded="false">
                💬
            </button>
            <section class="ai-chat-window" role="dialog" aria-label="Portfolio AI Chat" aria-modal="false" aria-hidden="true">
                <header class="ai-chat-header">
                    <div class="ai-chat-brand">
                        <div class="ai-chat-avatar" aria-hidden="true">🤖</div>
                        <div>
                            <h2 class="ai-chat-title">Portfolio AI</h2>
                            <p class="ai-chat-subtitle">Ask me about Sourabh's portfolio</p>
                        </div>
                    </div>
                    <button type="button" class="ai-chat-close" aria-label="Close chat">×</button>
                </header>
                <div class="ai-chat-messages" aria-live="polite" aria-relevant="additions text">
                    <div class="ai-chat-message bot">Hi! I'm Sourabh's portfolio assistant. Ask me about his skills, projects, education, or experience.</div>
                </div>
                <div class="ai-chat-suggestions">
                    <button type="button" class="ai-chat-suggestion">Tell me about Sourabh</button>
                    <button type="button" class="ai-chat-suggestion">Show me his projects</button>
                    <button type="button" class="ai-chat-suggestion">What skills does he have?</button>
                </div>
                <form class="ai-chat-form">
                    <input class="ai-chat-input" type="text" name="message" placeholder="Ask a question..." maxlength="2000" autocomplete="off" aria-label="Your message">
                    <button class="ai-chat-send" type="submit" aria-label="Send message">➤</button>
                </form>
                <div class="ai-chat-footer">AI responses may occasionally be inaccurate.</div>
            </section>
        `;
        document.body.appendChild(root);

        const launcher = root.querySelector(".ai-chat-launcher");
        const panel = root.querySelector(".ai-chat-window");
        const closeButton = root.querySelector(".ai-chat-close");
        const messages = root.querySelector(".ai-chat-messages");
        const form = root.querySelector(".ai-chat-form");
        const input = root.querySelector(".ai-chat-input");
        const sendButton = root.querySelector(".ai-chat-send");
        const suggestions = root.querySelectorAll(".ai-chat-suggestion");
        let pending = false;

        function setOpen(open) {
            panel.classList.toggle("is-open", open);
            panel.setAttribute("aria-hidden", String(!open));
            launcher.setAttribute("aria-expanded", String(open));
            launcher.setAttribute("aria-label", open ? "Close portfolio AI chat" : "Open portfolio AI chat");
            if (open) window.setTimeout(() => input.focus(), 100);
        }

        function addMessage(text, sender, isError = false) {
            const message = document.createElement("div");
            message.className = `ai-chat-message ${sender}${isError ? " error" : ""}`;
            message.textContent = text;
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;
            return message;
        }

        async function sendMessage(rawMessage) {
            const message = rawMessage.trim();
            if (!message || pending) return;
            if (message.length > 2000) {
                addMessage("Please keep your message under 2000 characters.", "bot", true);
                return;
            }

            addMessage(message, "user");
            input.value = "";
            pending = true;
            sendButton.disabled = true;
            input.disabled = true;

            const typing = document.createElement("div");
            typing.className = "ai-chat-message bot ai-chat-typing";
            typing.textContent = "Thinking…";
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), 25000);

            try {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message }),
                    signal: controller.signal
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.error || data.message || `Request failed (${response.status})`);
                }
                const reply = typeof data.reply === "string" && data.reply.trim()
                    ? data.reply.trim()
                    : "Sorry, I couldn't generate a reply. Please try again.";
                typing.remove();
                addMessage(reply, "bot");
            } catch (error) {
                typing.remove();
                const explanation = error.name === "AbortError"
                    ? "The request took too long. Please try again."
                    : "I couldn't connect to the chatbot right now. Please check your connection and try again.";
                addMessage(explanation, "bot", true);
                console.error("Portfolio chatbot error:", error);
            } finally {
                window.clearTimeout(timeoutId);
                pending = false;
                sendButton.disabled = false;
                input.disabled = false;
                input.focus();
            }
        }

        launcher.addEventListener("click", () => {
            const open = !panel.classList.contains("is-open");
            setOpen(open);
        });
        closeButton.addEventListener("click", () => setOpen(false));
        form.addEventListener("submit", event => {
            event.preventDefault();
            sendMessage(input.value);
        });
        suggestions.forEach(button => {
            button.addEventListener("click", () => sendMessage(button.textContent));
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeChatbot, { once: true });
    } else {
        initializeChatbot();
    }
})();
