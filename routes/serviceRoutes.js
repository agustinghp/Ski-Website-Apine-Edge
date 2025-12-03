const express = require('express');
const router = express.Router();
const { deleteImage } = require('../uploadMiddleware');

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
                SELECT s.*, u.username, u.location, u.created_at as provider_created_at, u.id as provider_id, u.profile_image
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

            // Get all images for this service
            const images = await db.any(`
                SELECT image_path, is_primary
                FROM service_images
                WHERE service_id = $1
                ORDER BY is_primary DESC, id ASC
            `, [serviceId]);

            // Create provider object
            const provider = {
                id: service.provider_id,
                username: service.username,
                location: service.location,
                created_at: service.provider_created_at,
                profile_image: service.profile_image
            };

            // Check if current user is the owner
            const isOwner = viewerId === service.user_id;

            // Connection status between viewer and provider
            let connectionStatus = 'none';

            if (viewerId && !isOwner) {
                const connection = await db.oneOrNone(`
                    SELECT requester_id, receiver_id, status
                    FROM connections
                    WHERE (requester_id = $1 AND receiver_id = $2)
                       OR (requester_id = $2 AND receiver_id = $1)
                `, [viewerId, provider.id]);

                if (connection) {
                    connectionStatus = connection.status;
                }
            }

            res.render('pages/service-detail', {
                title: service.servicename,
                userId: viewerId,
                service,
                images,
                provider,
                isOwner,
                connectionStatus
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

    // Delete Service
    router.post('/:id/delete', async (req, res) => {
        try {
            const serviceId = parseInt(req.params.id, 10);
            const userId = req.session.userId;

            if (!userId) {
                return res.redirect('/login');
            }

            // Check if the user owns this service
            const service = await db.oneOrNone('SELECT user_id FROM Services WHERE id = $1', [serviceId]);

            if (!service) {
                return res.redirect('/profile');
            }

            if (service.user_id !== userId) {
                return res.status(403).send('Unauthorized');
            }

            // Get all image URLs before deleting
            const images = await db.any(`
                SELECT image_path
                FROM service_images
                WHERE service_id = $1
            `, [serviceId]);

            // Delete images from R2 cloud storage
            if (images && images.length > 0) {
                for (const image of images) {
                    try {
                        await deleteImage(image.image_path);
                        console.log(`Deleted image from R2: ${image.image_path}`);
                    } catch (error) {
                        console.error(`Error deleting image ${image.image_path}:`, error);
                        // Continue with other images even if one fails
                    }
                }
            }

            // Delete the service (CASCADE will handle related records)
            await db.none('DELETE FROM Services WHERE id = $1', [serviceId]);

            res.redirect('/profile');

        } catch (error) {
            console.error('Error deleting service:', error);
            res.redirect('/profile');
        }
    });

    return router;
};
