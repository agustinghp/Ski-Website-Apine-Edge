document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Connect to Socket.io ---
    const socket = io();

    // --- 2. Get DOM elements ---
    const connectionList = document.getElementById('connection-list');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const sendButton = chatForm ? chatForm.querySelector('button') : null;
    const placeholder = document.getElementById('chat-window-placeholder');
    const typingIndicator = document.getElementById('typing-indicator');
    let typingTimeout;
    const sidebar = document.querySelector('.chat-sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');


    let activeChatUserId = null;
    let activeChatUsername = null;

    if (!connectionList || !chatForm || !messageInput || !sendButton) {
        console.error('Chat elements not found in DOM.');
        return;
    }


    // --- AUTO-SELECT USER BASED ON ?user=ID ---
    const urlParams = new URLSearchParams(window.location.search);
    const autoUserId = urlParams.get('user');

    if (autoUserId) {
        loadChatForUser(autoUserId);
    }


    // -------------------------------
    // 3. Click connection in sidebar
    // -------------------------------
    connectionList.addEventListener('click', async (e) => {
        if (e.target && e.target.matches('.list-group-item-action')) {
            loadChatForUser(e.target.getAttribute('data-user-id'));
        }
        sidebar.classList.remove('open');
        toggleSidebarBtn.style.display = 'block';
    });

    // Sidebar toggle for mobile
    toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        // Hide the button when sidebar is open
        if (sidebar.classList.contains('open')) {
            toggleSidebarBtn.style.display = 'none';
        }
    });

    // Close the sidebar when clicking anywhere in the chat area (mobile)
    chatMessages.addEventListener('click', () => {
        sidebar.classList.remove('open');
        toggleSidebarBtn.style.display = 'block';
    });

    typingIndicator.addEventListener('click', () => {
        sidebar.classList.remove('open');
        toggleSidebarBtn.style.display = 'block';
    });

    chatForm.addEventListener('click', () => {
        sidebar.classList.remove('open');
        toggleSidebarBtn.style.display = 'block';
    });



    // --- Detect typing ---
    messageInput.addEventListener('input', () => {
        if (!activeChatUserId) return;

        // Notify server I'm typing
        socket.emit('typing', { toUserId: activeChatUserId });

        // Reset the timeout
        clearTimeout(typingTimeout);

        // After 1s of inactivity, send stopTyping
        typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', { toUserId: activeChatUserId });
        }, 1000);
    });


    // -------------------------------
    // 4. Send Message
    // -------------------------------
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const messageText = messageInput.value.trim();
        if (!messageText || !activeChatUserId) return;

        const nowIso = new Date().toISOString();

        // Emit to server
        socket.emit('sendMessage', {
            message: messageText,
            toUserId: activeChatUserId
        });

        // Show my own message instantly with timestamp
        appendMessage(messageText, 'sent', nowIso);

        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });


    // -------------------------------
    // 5. Receive Message
    // -------------------------------
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




    // -------------------------------
    // Helper: Append Message Bubble
    // -------------------------------
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


    // -------------------------------
    // Helper: Load Chat for Selected User
    // -------------------------------
    async function loadChatForUser(userId) {

        // Find sidebar item
        const userItem = document.querySelector(
            `.list-group-item-action[data-user-id="${userId}"]`
        );

        if (!userItem) return;

        if (placeholder) placeholder.style.display = 'none';

        // Clear active selection
        document.querySelectorAll('.list-group-item-action')
            .forEach(item => item.classList.remove('active'));

        // Highlight selected user
        userItem.classList.add('active');

        activeChatUserId = parseInt(userId, 10);
        activeChatUsername = userItem.getAttribute('data-username');


        // Reset UI
        chatMessages.innerHTML = '';
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.placeholder = `Message ${userItem.getAttribute('data-username')}`;

        // Fetch message history
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
            chatMessages.innerHTML = '<p class="text-danger">Could not load chat history.</p>';
        }

        // Join socket room
        socket.emit('joinRoom', { otherUserId: activeChatUserId });
    }


    // -------------------------------
    // Helper: Format timestamp
    // -------------------------------
    function formatTimestamp(ts) {
        const date = new Date(ts);
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });
    }

});
