document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------
    // 1. Socket.io connection
    // -----------------------------------
    const socket = io();

    // -----------------------------------
    // 2. DOM Elements
    // -----------------------------------
    const connectionList   = document.getElementById('connection-list');
    const chatMessages     = document.getElementById('chat-messages');
    const chatForm         = document.getElementById('chat-form');
    const messageInput     = document.getElementById('message-input');
    const sendButton       = chatForm ? chatForm.querySelector('button') : null;
    const placeholder      = document.getElementById('chat-window-placeholder');
    const typingIndicator  = document.getElementById('typing-indicator');
    const sidebar          = document.querySelector('.chat-sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');

    let typingTimeout;
    let activeChatUserId   = null;
    let activeChatUsername = null;

    // Guard: if core elements are missing, exit early
    if (!connectionList || !chatForm || !messageInput || !sendButton) {
        console.error('Chat elements not found in DOM.');
        return;
    }

    // -----------------------------------
    // 3. Helpers
    // -----------------------------------

    const isMobile = () => window.innerWidth < 900;

    function closeSidebarOnMobile() {
        if (!isMobile()) return;
        sidebar.classList.remove('open');
        toggleSidebarBtn.style.display = 'block';
    }

    function openSidebarOnMobile() {
        if (!isMobile()) return;
        sidebar.classList.add('open');
        toggleSidebarBtn.style.display = 'none';
    }

    function formatTimestamp(ts) {
        const date = new Date(ts);
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    function appendMessage(text, type, timestamp) {
        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble', type);

        const time = timestamp ? formatTimestamp(timestamp) : '';

        bubble.innerHTML = `
            <div>${text}</div>
            <div class="message-time">${time}</div>
        `;

        chatMessages.appendChild(bubble);
    }

    async function loadChatForUser(userId) {
        // Find corresponding sidebar item
        const userItem = document.querySelector(
            `.list-group-item-action[data-user-id="${userId}"]`
        );
        if (!userItem) return;

        // Hide placeholder once a chat is selected
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Clear previous active state, then highlight current
        document
            .querySelectorAll('.list-group-item-action')
            .forEach(item => item.classList.remove('active'));

        userItem.classList.add('active');

        // Set active chat state
        activeChatUserId   = parseInt(userId, 10);
        activeChatUsername = userItem.getAttribute('data-username');

        // Reset chat UI
        chatMessages.innerHTML      = '';
        messageInput.disabled       = false;
        sendButton.disabled         = false;
        messageInput.placeholder    = `Message ${activeChatUsername}`;

        // Fetch existing message history
        try {
            const response = await fetch(`/chat/history/${activeChatUserId}`);
            if (!response.ok) throw new Error('Failed to fetch history');

            const history = await response.json();

            history.forEach(msg => {
                appendMessage(
                    msg.message_text,
                    msg.sender_id === currentUserId ? 'sent' : 'received',
                    msg.created_at
                );
            });

            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (err) {
            console.error('Error loading chat history:', err);
            chatMessages.innerHTML =
                '<p class="text-danger">Could not load chat history.</p>';
        }

        // Join socket room for this conversation
        socket.emit('joinRoom', { otherUserId: activeChatUserId });
    }

    // -----------------------------------
    // 4. Auto-select chat via ?user=ID
    // -----------------------------------
    const urlParams   = new URLSearchParams(window.location.search);
    const autoUserId  = urlParams.get('user');

    if (autoUserId) {
        loadChatForUser(autoUserId);
    }

    // -----------------------------------
    // 5. Sidebar interactions
    // -----------------------------------

    // Click on a user in the connections list
    connectionList.addEventListener('click', (e) => {
        if (!e.target || !e.target.matches('.list-group-item-action')) return;

        const clickedUserId = parseInt(e.target.getAttribute('data-user-id'), 10);

        // If clicking the already active chat user → do nothing
        if (clickedUserId === activeChatUserId) {
            return;
        }

        // Otherwise load the chat normally
        loadChatForUser(clickedUserId);

        // Close sidebar on mobile after selecting a chat
        closeSidebarOnMobile();
    });

    // Sidebar toggle button (mobile)
    toggleSidebarBtn.addEventListener('click', () => {
        if (!isMobile()) return;

        if (sidebar.classList.contains('open')) {
            closeSidebarOnMobile();
        } else {
            openSidebarOnMobile();
        }
    });

    // Close sidebar when interacting with chat area (mobile)
    chatMessages.addEventListener('click', () => {
        closeSidebarOnMobile();
    });

    typingIndicator.addEventListener('click', () => {
        closeSidebarOnMobile();
    });

    chatForm.addEventListener('click', () => {
        closeSidebarOnMobile();
    });

    // -----------------------------------
    // 6. Typing indicator
    // -----------------------------------
    messageInput.addEventListener('input', () => {
        if (!activeChatUserId) return;

        // Notify server that I'm typing
        socket.emit('typing', { toUserId: activeChatUserId });

        // Reset timeout
        clearTimeout(typingTimeout);

        // After 1s of inactivity, send "stopTyping"
        typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', { toUserId: activeChatUserId });
        }, 1000);
    });

    // -----------------------------------
    // 7. Sending messages
    // -----------------------------------
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const messageText = messageInput.value.trim();
        if (!messageText || !activeChatUserId) return;

        const nowIso = new Date().toISOString();

        // Send message to server
        socket.emit('sendMessage', {
            message: messageText,
            toUserId: activeChatUserId,
        });

        // Optimistically render my own message
        appendMessage(messageText, 'sent', nowIso);

        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // -----------------------------------
    // 8. Receiving socket events
    // -----------------------------------
    socket.on('receiveMessage', (data) => {
        if (data.fromUserId === activeChatUserId) {
            appendMessage(data.message, 'received', data.created_at);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    socket.on('typing', (data) => {
        if (data.fromUserId === activeChatUserId) {
            typingIndicator.innerHTML = `<em>${activeChatUsername} is typing...</em>`;
            typingIndicator.style.display = 'block';
        }
    });

    socket.on('stopTyping', (data) => {
        if (data.fromUserId === activeChatUserId) {
            typingIndicator.style.display = 'none';
        }
    });
});
