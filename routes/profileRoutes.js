const express = require('express');
const router = express.Router();
const { upload, processProfileImage, deleteImage } = require('../uploadMiddleware');

module.exports = (db, auth) => {

    router.get('/', auth, async (req, res) => {
        try {
            const currentUserId = req.session.userId;

            // 1. Get User Info
            const user = await db.one('SELECT id, username, email, location, profile_image FROM users WHERE id = $1', [currentUserId]);

            // 2. Get Connections
            const connections = await db.any(`
                SELECT 
                    u.id AS user_id, 
                    u.username,
                    u.profile_image
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

            // 3. Get User's Products with images
            const products = await db.any(`
                SELECT 
                    p.*,
                    pi.image_path as primary_image
                FROM Products p
                LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
                WHERE p.user_id = $1 
                ORDER BY p.id DESC
            `, [currentUserId]);

            // 4. Get User's Services with images
            const services = await db.any(`
                SELECT 
                    s.*,
                    si.image_path as primary_image
                FROM Services s
                LEFT JOIN service_images si ON s.id = si.service_id AND si.is_primary = true
                WHERE s.user_id = $1 
                ORDER BY s.id DESC
            `, [currentUserId]);

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

    // Upload/Update Profile Picture
    router.post('/upload-picture', auth, upload.single('profileImage'), async (req, res) => {
        try {
            const userId = req.session.userId;

            if (!req.file) {
                return res.redirect('/profile');
            }

            // Get current profile image to delete it
            const user = await db.oneOrNone('SELECT profile_image FROM users WHERE id = $1', [userId]);
            
            if (user && user.profile_image) {
                await deleteImage(user.profile_image);
            }

            // Process and save new image
            const imagePath = await processProfileImage(req.file.buffer, userId);

            // Update database
            await db.none('UPDATE users SET profile_image = $1 WHERE id = $2', [imagePath, userId]);

            res.redirect('/profile');

        } catch (error) {
            console.error('Error uploading profile picture:', error);
            res.redirect('/profile');
        }
    });

    // View connection requests
    router.get('/requests', auth, async (req, res) => {
        try {
            const currentUserId = req.session.userId;

            // Fetch users who sent YOU a connection request (pending)
            const incomingRequests = await db.any(`
                SELECT 
                    u.id AS user_id,
                    u.username,
                    u.location,
                    u.created_at,
                    u.profile_image
                FROM connections c
                JOIN users u ON u.id = c.requester_id
                WHERE c.receiver_id = $1
                AND c.status = 'pending';
            `, [currentUserId]);

            // Fetch all accepted connections
            const acceptedConnections = await db.any(`
                SELECT 
                    u.id AS user_id,
                    u.username,
                    u.location,
                    u.profile_image
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
