// Main JavaScript for UI Interactions

document.addEventListener('DOMContentLoaded', () => {
    // --- Countdown Timer ---
    const entranceDate = new Date('2026-04-03T09:45:00');
    const daysLeftElement = document.getElementById('days-left');

    function updateCountdown() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const entranceDayStart = new Date(
            entranceDate.getFullYear(),
            entranceDate.getMonth(),
            entranceDate.getDate()
        );
        const diff = entranceDayStart - todayStart;

        if (diff > 0) {
            const days = Math.round(diff / (1000 * 60 * 60 * 24));
            daysLeftElement.innerText = days;
        } else {
            daysLeftElement.innerText = "0";
        }
    }

    updateCountdown();
    setInterval(updateCountdown, 1000 * 60 * 60); // Update every hour

    // --- Scroll Reveal Animation ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });

    // --- Chat Widget Logic ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWidget = document.getElementById('chat-widget');
    const closeChatBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBody = document.getElementById('chat-body');

    // Open/Close
    chatToggleBtn.addEventListener('click', () => {
        chatWidget.style.display = 'flex';
        chatToggleBtn.style.display = 'none';
        userInput.focus();
    });

    closeChatBtn.addEventListener('click', () => {
        chatWidget.style.display = 'none';
        chatToggleBtn.style.display = 'block';
    });

    // Send Message
    function sendMessage() {
        const text = userInput.value.trim();
        if (text === "") return;

        // Add User Message to Chat
        addMessage(text, 'user');
        userInput.value = '';

        // Get Bot Response from Agent
        if (typeof agent !== 'undefined') {
            const response = agent.generateResponse(text);

            // Artificial delay for realism
            setTimeout(() => {
                addMessage(response, 'bot');
            }, 500);
        } else {
            addMessage("エラーが発生しました。エージェントが読み込まれていません。", 'bot');
        }
    }

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);

        // Parsing Markdown-like bolding (**text**) for simple formatting
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        msgDiv.innerHTML = formattedText;

        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll to bottom
    }

    // --- Smooth Scroll for Navigation ---
    document.querySelectorAll('header nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
