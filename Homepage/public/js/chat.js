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

    let activeChatUserId = null; // Stores the ID of the user we are chatting with

    if (!connectionList || !chatForm || !messageInput || !sendButton) {
        console.error('Chat elements not found in DOM.');
        return;
    }

    // --- AUTO-SELECT USER BASED ON ?user=ID ---
    const urlParams = new URLSearchParams(window.location.search);
    const autoUserId = urlParams.get('user');

    if (autoUserId) {
        const autoUserItem = document.querySelector(
            `.list-group-item-action[data-user-id="${autoUserId}"]`
        );
        if (autoUserItem) {
            autoUserItem.click();
            autoUserItem.classList.add('active');
            messageInput.focus();
        }
    }

    // --- 3. Handle clicking on a connection ---
    connectionList.addEventListener('click', async (e) => {
        if (e.target && e.target.matches('.list-group-item-action')) {

            if (placeholder) placeholder.style.display = 'none';

            // Remove old active selection
            document.querySelectorAll('.list-group-item-action').forEach(item => {
                item.classList.remove('active');
            });

            // Set new active
            e.target.classList.add('active');

            // Set active chat user
            activeChatUserId = parseInt(e.target.getAttribute('data-user-id'), 10);

            // Reset UI
            chatMessages.innerHTML = '';
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.placeholder = `Message ${e.target.getAttribute('data-username')}`;

            // Fetch history
            try {
                const response = await fetch(`/chat/history/${activeChatUserId}`);
                if (!response.ok) throw new Error('Failed to fetch history');

                const history = await response.json();

                history.forEach(msg => {
                    appendMessage(
                        msg.message_text,
                        msg.sender_id === currentUserId ? 'sent' : 'received'
                    );
                });

                chatMessages.scrollTop = chatMessages.scrollHeight;
            } catch (err) {
                console.error('Error fetching history:', err);
                chatMessages.innerHTML = '<p class="text-danger">Could not load chat history.</p>';
            }

            // Join room for socket
            socket.emit('joinRoom', { otherUserId: activeChatUserId });
        }
    });

    // --- 4. Handle sending a message ---
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const messageText = messageInput.value.trim();
        if (!messageText || !activeChatUserId) return;

        // Send to server
        socket.emit('sendMessage', {
            message: messageText,
            toUserId: activeChatUserId
        });

        appendMessage(messageText, 'sent');

        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // --- 5. Receive messages ---
    socket.on('receiveMessage', (data) => {
        if (data.fromUserId === activeChatUserId) {
            appendMessage(data.message, 'received');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    // --- Helper to add message bubbles ---
    function appendMessage(text, type) {
        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble', type);
        bubble.textContent = text;
        chatMessages.appendChild(bubble);
    }
});
