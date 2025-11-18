const express = require('express');
const router = express.Router();

module.exports = (db, auth) => {

    router.get('/', auth, async (req, res) => {
        try {
            const currentUserId = req.session.userId;

            // 1. Get User Info
            const user = await db.one('SELECT id, username, email, location FROM users WHERE id = $1', [currentUserId]);

            // 2. Get Connections (Same query as chat page)
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

            // 3. Get User's Products
            const products = await db.any('SELECT * FROM Products WHERE user_id = $1 ORDER BY id DESC', [currentUserId]);

            // 4. Get User's Services
            const services = await db.any('SELECT * FROM Services WHERE user_id = $1 ORDER BY id DESC', [currentUserId]);

            // 5. Render the page
            res.render('pages/profile', {
                title: 'My Profile',
                userId: currentUserId,
                user: user,
                connections: connections,
                products: products,
                services: services
            });

        } catch (error) {
            console.error('Error fetching profile page:', error);
            res.render('pages/home', {
                title: 'Error',
                error: 'Could not load your profile.',
                userId: req.session.userId
            });
        }
    });

    // View connection requests
    router.get('/requests', auth, async (req, res) => {
        try {
            const currentUserId = req.session.userId;

            // 1️⃣ Fetch users who sent YOU a connection request (pending)
            const incomingRequests = await db.any(`
            SELECT 
                u.id AS user_id,
                u.username,
                u.location,
                u.created_at
            FROM connections c
            JOIN users u ON u.id = c.requester_id
            WHERE c.receiver_id = $1
            AND c.status = 'pending';
        `, [currentUserId]);


            // 2️⃣ Fetch all accepted connections
            const acceptedConnections = await db.any(`
            SELECT 
                u.id AS user_id,
                u.username,
                u.location
            FROM connections c
            JOIN users u ON 
                CASE
                    WHEN c.requester_id = $1 THEN c.receiver_id = u.id
                    WHEN c.receiver_id = $1 THEN c.requester_id = u.id
                END
            WHERE 
                (c.requester_id = $1 OR c.receiver_id = $1)
                AND c.status = 'accepted';
        `, [currentUserId]);


            res.render('pages/connection-requests', {
                title: 'Connection Requests',
                userId: currentUserId,
                incomingRequests,
                acceptedConnections
            });

        } catch (error) {
            console.error("Error loading connection requests:", error);
            res.redirect('/profile');
        }
    });

    return router;
};
