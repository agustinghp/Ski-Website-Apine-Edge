const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // Service Detail Page
    router.get('/:id', async (req, res) => {
        try {
            const serviceId = parseInt(req.params.id, 10);
            const viewerId = req.session.userId; // logged-in user (may be undefined)

            if (isNaN(serviceId)) {
                return res.render('pages/service-detail', {
                    title: 'Service Not Found',
                    userId: viewerId,
                    error: 'Invalid service ID.'
                });
            }

            // Get service with provider information
            const service = await db.oneOrNone(`
                SELECT s.*, u.username, u.location, u.created_at as provider_created_at, u.id as provider_id
                FROM Services s
                JOIN users u ON s.user_id = u.id
                WHERE s.id = $1
            `, [serviceId]);

            if (!service) {
                return res.render('pages/service-detail', {
                    title: 'Service Not Found',
                    userId: viewerId,
                    error: 'Service not found.'
                });
            }

            // Create provider object
            const provider = {
                id: service.provider_id,
                username: service.username,
                location: service.location,
                created_at: service.provider_created_at
            };

            // Check if current user is the owner
            const isOwner = viewerId === service.user_id;

            // --- NEW: Connection status between viewer and provider ---
            let connectionStatus = 'none'; // 'none', 'pending', 'accepted', 'declined'

            if (viewerId && !isOwner) {
                const connection = await db.oneOrNone(`
                    SELECT requester_id, receiver_id, status
                    FROM connections
                    WHERE (requester_id = $1 AND receiver_id = $2)
                       OR (requester_id = $2 AND receiver_id = $1)
                `, [viewerId, provider.id]);

                if (connection) {
                    connectionStatus = connection.status; // pending / accepted / declined
                }
            }
            // --- END NEW ---

            res.render('pages/service-detail', {
                title: service.servicename,
                userId: viewerId,
                service,
                provider,
                isOwner,
                connectionStatus   // <-- now available to the template
            });

        } catch (error) {
            console.error('Error fetching service details:', error);
            res.render('pages/service-detail', {
                title: 'Error',
                userId: req.session.userId,
                error: 'An error occurred while loading the service.'
            });
        }
    });

    return router;
};
