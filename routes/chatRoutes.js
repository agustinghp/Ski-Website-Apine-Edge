const express = require('express');
const router = express.Router();

module.exports = (db, auth) => {

    // GET /chat - Renders the chat page
    router.get('/', auth, async (req, res) => {
        try {
            const currentUserId = req.session.userId;

            const connections = await db.any(`
                SELECT 
                    u.id AS user_id, 
                    u.username
                FROM connections c
                JOIN users u ON 
                    CASE
                        WHEN c.requester_id = $1 THEN c.receiver_id = u.id
                        WHEN c.receiver_id = $1 THEN c.requester_id = u.id
                    END
                WHERE 
                    (c.requester_id = $1 OR c.receiver_id = $1) 
                    AND c.status = 'accepted'
                    AND u.id != $1;
            `, [currentUserId]);

            res.render('pages/chat', {
                title: 'Chat',
                connections: connections,
                currentUserId: currentUserId, // Pass this to the template!
                userId: currentUserId // For navbar
            });

        } catch (error) {
            console.error('Error fetching chat page:', error);
            res.render('pages/home', {
                title: 'Error',
                error: 'Could not load chat.',
                userId: req.session.userId // Pass session data
            });
        }
    });

    // API route to get message history between two users
    router.get('/history/:otherUserId', auth, async (req, res) => {
        try {
            const currentUserId = req.session.userId;
            const otherUserId = parseInt(req.params.otherUserId, 10);

            if (isNaN(otherUserId)) {
                return res.status(400).json({ error: 'Invalid user ID.' });
            }

            const history = await db.any(`
                SELECT * FROM messages
                WHERE 
                    (sender_id = $1 AND receiver_id = $2) 
                    OR (sender_id = $2 AND receiver_id = $1)
                ORDER BY created_at ASC;
            `, [currentUserId, otherUserId]);

            res.json(history); // Send the history back as JSON

        } catch (error) {
            console.error('Error fetching chat history:', error);
            res.status(500).json({ error: 'Could not fetch history.' });
        }
    });

    router.post('/mark-read/:otherUserId', auth, async (req, res) => {
        const currentUserId = req.session.userId;      // the reader
        const otherUserId = parseInt(req.params.otherUserId, 10); // the sender

        console.log('📩 /chat/mark-read HIT', { readerId: currentUserId, otherUserId });

        try {
            await db.none(`
            UPDATE messages
            SET status = 'read'
            WHERE sender_id = $1
              AND receiver_id = $2
              AND status = 'sent'
        `, [otherUserId, currentUserId]);

            console.log('✅ Messages updated to read in DB');

            const io = req.app.get('io');
            console.log('🔍 io from req.app.get("io") is:', !!io);

            const roomName = [currentUserId, otherUserId].sort().join('-');
            console.log('📡 Emitting messagesRead to room:', roomName);

            if (!io) {
                console.error('❌ io is undefined in /mark-read route');
            } else {
                io.to(roomName).emit('messagesRead', {
                    readerId: currentUserId
                });
            }

            res.sendStatus(200);
        } catch (err) {
            console.error('Error in mark-read:', err);
            res.sendStatus(500);
        }
    });



    return router;
};

