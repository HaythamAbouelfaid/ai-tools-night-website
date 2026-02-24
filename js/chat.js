// chat.js - OpenRouter AI Assistant Widget

(function initChatWidget() {
    if (document.getElementById('ai-chat-btn')) return; // Prevent duplicate injection

    // 1. Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        /* Floating Button */
        #ai-chat-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent-magenta), var(--accent-cyan));
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(217, 70, 239, 0.5);
            z-index: 10000;
            transition: all 0.3s ease;
            animation: float 3s ease-in-out infinite, pulse-glow 2s infinite;
        }

        #ai-chat-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 0 30px rgba(0, 240, 255, 0.6);
        }

        /* Chat Modal */
        #ai-chat-widget {
            position: fixed;
            bottom: 110px;
            right: 30px;
            width: 360px;
            height: 520px;
            max-height: calc(100vh - 140px);
            background: rgba(10, 15, 28, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            font-family: 'Inter', sans-serif;
        }

        #ai-chat-widget.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0) scale(1);
        }

        .chat-header {
            padding: 16px 20px;
            background: rgba(255,255,255,0.05);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chat-header-title {
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-size: 1.1rem;
        }

        .chat-header-close {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            transition: color 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
        }

        .chat-header-close:hover {
            color: var(--accent-red);
        }

        .chat-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            scroll-behavior: smooth;
        }

        .chat-body::-webkit-scrollbar {
            width: 6px;
        }
        .chat-body::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.15);
            border-radius: 3px;
        }

        .chat-msg {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.95rem;
            line-height: 1.5;
            word-wrap: break-word;
            animation: fadeIn 0.3s ease;
        }

        .chat-msg.bot {
            align-self: flex-start;
            background: rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.9);
            border-bottom-left-radius: 4px;
        }

        .chat-msg.user {
            align-self: flex-end;
            background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
            color: #000;
            font-weight: 500;
            border-bottom-right-radius: 4px;
        }

        /* Markdown styling for bot */
        .chat-msg.bot p { margin-bottom: 8px; margin-top: 0; }
        .chat-msg.bot p:last-child { margin-bottom: 0; }
        .chat-msg.bot ul { padding-left: 20px; margin-bottom: 8px; margin-top: 4px; }
        .chat-msg.bot code { background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.85em; }
        .chat-msg.bot a { color: var(--accent-cyan); text-decoration: underline; }

        .chat-input-area {
            padding: 16px;
            background: rgba(0,0,0,0.2);
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .chat-input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 10px 14px;
            color: white;
            font-family: inherit;
            outline: none;
            transition: border-color 0.3s;
        }

        .chat-input:focus {
            border-color: var(--accent-cyan);
        }

        .chat-send-btn {
            background: var(--accent-cyan);
            color: #000;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }

        .chat-send-btn:hover {
            transform: scale(1.05);
            background: #fff;
        }

        .chat-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .typing-indicator {
            display: flex;
            gap: 4px;
            padding: 12px 16px;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        .typing-dot {
            width: 6px;
            height: 6px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        @keyframes pulse-glow {
            0% { box-shadow: 0 0 15px rgba(217, 70, 239, 0.4); }
            50% { box-shadow: 0 0 30px rgba(0, 240, 255, 0.6); }
            100% { box-shadow: 0 0 15px rgba(217, 70, 239, 0.4); }
        }

        @media (max-width: 480px) {
            #ai-chat-widget {
                width: calc(100% - 40px);
                right: 20px;
                bottom: 100px;
            }
            #ai-chat-btn {
                right: 20px;
                bottom: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML Elements
    const chatBtn = document.createElement('button');
    chatBtn.id = 'ai-chat-btn';
    chatBtn.setAttribute('aria-label', 'Open AI Assistant');
    chatBtn.innerHTML = `<i data-lucide="bot" size="24"></i>`;

    const widgetBox = document.createElement('div');
    widgetBox.id = 'ai-chat-widget';
    widgetBox.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-title">
                <i data-lucide="sparkles" size="20" style="color:var(--accent-cyan)"></i>
                AI Assistant
            </div>
            <button class="chat-header-close" id="chat-close" aria-label="Close">
                <i data-lucide="x" size="20"></i>
            </button>
        </div>
        <div class="chat-body" id="chat-body">
            <div class="chat-msg bot">Hi there! I'm the AI Tools Explorers guide. Ask me about our prompts, career roles, or anything AI-related!</div>
        </div>
        <div class="chat-input-area">
            <input type="text" id="chat-input" class="chat-input" placeholder="Type a message..." autocomplete="off">
            <button id="chat-send" class="chat-send-btn">
                <i data-lucide="send" size="18"></i>
            </button>
        </div>
    `;

    document.body.appendChild(widgetBox);
    document.body.appendChild(chatBtn);

    // Render icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 3. Logic & State
    let isChatOpen = false;
    let messagesHistory = [];
    let isWaitingForResponse = false;

    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const closeBtn = document.getElementById('chat-close');

    const toggleChat = () => {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            widgetBox.classList.add('active');
            chatInput.focus();
        } else {
            widgetBox.classList.remove('active');
        }
    };

    chatBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    const scrollToBottom = () => {
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const appendMessage = (text, role) => {
        const msg = document.createElement('div');
        msg.className = \`chat-msg \${role}\`;
        
        let displayHtml = text;
        if (role === 'bot') {
            displayHtml = displayHtml
                .replace(/\\n/g, '<br/>')
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                .replace(/\\[(.*?)\\]\\((.*?)\\)/g, '<a href="$2" target="_blank">$1</a>');
        }
        
        msg.innerHTML = displayHtml;
        chatBody.appendChild(msg);
        scrollToBottom();
        
        // Setup copy overlay for bot messages
        if(role === 'bot') {
            msg.style.position = 'relative';
            msg.addEventListener('dblclick', () => {
                navigator.clipboard.writeText(text);
                const originalBg = msg.style.background;
                msg.style.background = 'rgba(0, 240, 255, 0.2)';
                setTimeout(() => msg.style.background = originalBg, 500);
            });
        }
    };

    const showTyping = () => {
        const typing = document.createElement('div');
        typing.className = 'typing-indicator';
        typing.id = 'typing-indicator';
        typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatBody.appendChild(typing);
        scrollToBottom();
    };

    const removeTyping = () => {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    };

    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text || isWaitingForResponse) return;

        chatInput.value = '';
        appendMessage(text, 'user');
        messagesHistory.push({ role: "user", content: text });
        
        isWaitingForResponse = true;
        sendBtn.disabled = true;

        setTimeout(async () => {
            showTyping();
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: messagesHistory })
                });

                removeTyping();

                if (!response.ok) {
                    let errMsg = "API Error";
                    try { const errObj = await response.json(); errMsg = errObj.error || errMsg; } catch(e){}
                    appendMessage('⚠️ ' + errMsg, 'bot');
                    isWaitingForResponse = false;
                    sendBtn.disabled = false;
                    return;
                }

                const data = await response.json();
                if (data.response) {
                    messagesHistory.push({ role: "assistant", content: data.response });
                    appendMessage(data.response, 'bot');
                } else if (data.error) {
                    appendMessage('⚠️ ' + data.error, 'bot');
                } else {
                    appendMessage("Sorry, I encountered an issue parsing the response.", 'bot');
                }
            } catch (err) {
                console.error("Chat Request Error:", err);
                removeTyping();
                appendMessage("Network error. Could not connect to API.", 'bot');
            }
            
            isWaitingForResponse = false;
            sendBtn.disabled = false;
            setTimeout(() => chatInput.focus(), 100);
            
        }, 300); // 300ms realistic processing delay
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();
