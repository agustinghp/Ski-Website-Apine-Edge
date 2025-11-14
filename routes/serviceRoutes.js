const express = require('express');
const router = express.Router();

module.exports = (db) => {


    // Service Detail Page
    router.get('/:id', async (req, res) => {
        try {
            const serviceId = parseInt(req.params.id, 10);

            if (isNaN(serviceId)) {
                return res.render('pages/service-detail', {
                    title: 'Service Not Found',
                    userId: req.session.userId,
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
                    userId: req.session.userId,
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
            const isOwner = req.session.userId === service.user_id;

            res.render('pages/service-detail', {
                title: service.servicename,
                userId: req.session.userId,
                service: service,
                provider: provider,
                isOwner: isOwner
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
