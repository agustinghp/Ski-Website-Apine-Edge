const express = require('express');
const router = express.Router();

module.exports = (db, auth) => {

    // View another user's profile
    router.get('/:id', auth, async (req, res) => {
        const profileId = parseInt(req.params.id, 10);
        const viewerId = req.session.userId;

        if (viewerId === profileId) {
            return res.redirect('/profile');
        }

        try {
            // 1. Get profile user's info
            const user = await db.oneOrNone(
                `SELECT id, username, email, location, created_at
                FROM users
                WHERE id = $1`,
                [profileId]
            );

            if (!user) {
                return res.render('pages/userProfile', {
                    title: 'User Not Found',
                    userId: viewerId,
                    error: 'This user does not exist.'
                });
            }

            // 2. Check connection status
            const connection = await db.oneOrNone(`
            SELECT requester_id, receiver_id, status
            FROM connections
            WHERE (requester_id = $1 AND receiver_id = $2)
            OR (requester_id = $2 AND receiver_id = $1)
            `,
                [viewerId, profileId]
            );

            let connectionStatus = 'none';
            let isRequester = false;

            if (connection) {
                connectionStatus = connection.status;
                isRequester = connection.requester_id === viewerId;
            }

            // 3. Email visibility
            const showEmail = connectionStatus === 'accepted';

            // 4. Get user's products
            const products = await db.any(
                `SELECT id, productname, price 
                FROM Products 
                WHERE user_id = $1 
                ORDER BY id DESC`,
                [profileId]
            );

            // 5. Get user's services
            const services = await db.any(
                `SELECT id, servicename, price 
                FROM Services 
                WHERE user_id = $1 
                ORDER BY id DESC`,
                [profileId]
            );


            // 6. Render the profile
            res.render('pages/userProfile', {
                title: `${user.username}'s Profile`,
                userId: viewerId,
                user,
                profileId,
                connectionStatus,
                isRequester,
                showEmail,
                products,
                services
            });



        } catch (err) {
            console.error('Error loading user profile:', err);
            res.render('pages/userProfile', {
                title: 'Error',
                userId: viewerId,
                error: 'Could not load profile.'
            });
        }
    });

    // Send connection request
    router.post('/:id/request', auth, async (req, res) => {
        const viewerId = req.session.userId;
        const profileId = parseInt(req.params.id, 10);

        try {
            // 1️⃣ Check if ANY connection already exists between the two users
            const existing = await db.oneOrNone(
                `
            SELECT *
            FROM connections
            WHERE (requester_id = $1 AND receiver_id = $2)
               OR (requester_id = $2 AND receiver_id = $1)
            `,
                [viewerId, profileId]
            );

            // 2️⃣ If anything exists → do NOT create a duplicate
            if (existing) {
                console.log("Connection already exists, skipping insert.");
                return res.redirect(`/users/${profileId}`);
            }

            // 3️⃣ Insert the new request ONLY if none exists
            await db.none(
                `
            INSERT INTO connections (requester_id, receiver_id, status)
            VALUES ($1, $2, 'pending')
            `,
                [viewerId, profileId]
            );

            res.redirect(`/users/${profileId}`);

        } catch (err) {
            console.error("Error sending request:", err);
            res.redirect(`/users/${profileId}`);
        }
    });


    // Accept connection
    router.post('/:id/accept', auth, async (req, res) => {
        const viewerId = req.session.userId;  // receiver
        const requesterId = parseInt(req.params.id, 10);

        try {
            await db.none(`
      UPDATE connections
      SET status = 'accepted'
      WHERE requester_id = $1 AND receiver_id = $2
    `, [requesterId, viewerId]);

            const redirectTo = req.body.redirectTo || `/users/${requesterId}`;
            res.redirect(redirectTo);

        } catch (err) {
            console.error("Error accepting request:", err);
            const redirectTo = req.body.redirectTo || `/users/${requesterId}`;
            res.redirect(redirectTo);

        }
    });

    // Decline connection
    router.post('/:id/decline', auth, async (req, res) => {
        const viewerId = req.session.userId;  // receiver
        const requesterId = parseInt(req.params.id, 10);

        try {
            await db.none(`
      UPDATE connections
      SET status = 'declined'
      WHERE requester_id = $1 AND receiver_id = $2
    `, [requesterId, viewerId]);

            const redirectTo = req.body.redirectTo || `/users/${requesterId}`;
            res.redirect(redirectTo);

        } catch (err) {
            console.error("Error declining request:", err);
            const redirectTo = req.body.redirectTo || `/users/${requesterId}`;
            res.redirect(redirectTo);

        }
    });
    // Re-send connection request after you declined theirs
    router.post('/:id/request-again', auth, async (req, res) => {
        const viewerId = req.session.userId;              // You (logged-in user)
        const otherUserId = parseInt(req.params.id, 10);  // Profile you are viewing

        try {
            // 1. Delete ANY existing connection between the two users
            await db.none(`
            DELETE FROM connections
            WHERE (requester_id = $1 AND receiver_id = $2)
               OR (requester_id = $2 AND receiver_id = $1)
        `, [viewerId, otherUserId]);

            // 2. Create a fresh pending request (YOU → THEM)
            await db.none(`
            INSERT INTO connections (requester_id, receiver_id, status)
            VALUES ($1, $2, 'pending')
        `, [viewerId, otherUserId]);

            // 3. Redirect to the user's profile
            res.redirect(`/users/${otherUserId}`);

        } catch (err) {
            // Fail gracefully by redirecting back anyway
            res.redirect(`/users/${otherUserId}`);
        }
    });


    // Request Again
    router.post('/:id/request-again', auth, async (req, res) => {
        const requesterId = req.session.userId;
        const receiverId = parseInt(req.params.id, 10);

        try {
            // Delete any old declined/pending connection
            await db.none(`
            DELETE FROM connections
            WHERE (requester_id = $1 AND receiver_id = $2)
               OR (requester_id = $2 AND receiver_id = $1)
        `, [requesterId, receiverId]);

            // Create new pending request
            await db.none(`
            INSERT INTO connections (requester_id, receiver_id, status)
            VALUES ($1, $2, 'pending')
        `, [requesterId, receiverId]);

            return res.redirect(`/users/${receiverId}`);
        } catch (err) {
            console.error('Error requesting again:', err);
            return res.redirect(`/users/${receiverId}`);
        }
    });

    router.post('/:id/delete-connection', auth, async (req, res) => {
        const viewerId = req.session.userId;
        const otherUserId = parseInt(req.params.id, 10);

        try {
            await db.none(`
            DELETE FROM connections
            WHERE (requester_id = $1 AND receiver_id = $2)
               OR (requester_id = $2 AND receiver_id = $1)
        `, [viewerId, otherUserId]);

            res.redirect(`/users/${otherUserId}`);
        } catch (err) {
            res.redirect(`/users/${otherUserId}`);
        }
    });




    return router;
};
