const express = require('express');
const router = express.Router();
const { deleteImage } = require('../uploadMiddleware');

module.exports = (db) => {

    // Product Detail Page
    router.get('/:id', async (req, res) => {
        try {
            const productId = parseInt(req.params.id, 10);
            const viewerId = req.session.userId; // logged-in user (may be undefined)

            if (isNaN(productId)) {
                return res.render('pages/product-detail', {
                    title: 'Product Not Found',
                    userId: viewerId,
                    error: 'Invalid product ID.'
                });
            }

            // Get product with seller information
            const product = await db.oneOrNone(`
                SELECT p.*, u.username, u.location, u.created_at as seller_created_at, u.id as seller_id, u.profile_image
                FROM Products p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = $1
            `, [productId]);

            if (!product) {
                return res.render('pages/product-detail', {
                    title: 'Product Not Found',
                    userId: viewerId,
                    error: 'Product not found.'
                });
            }

            // Get all images for this product
            const images = await db.any(`
                SELECT image_path, is_primary
                FROM product_images
                WHERE product_id = $1
                ORDER BY is_primary DESC, id ASC
            `, [productId]);

            // Create seller object
            const seller = {
                id: product.seller_id,
                username: product.username,
                location: product.location,
                created_at: product.seller_created_at,
                profile_image: product.profile_image
            };

            // Check if current user is the owner
            const isOwner = viewerId === product.user_id;

            // Connection status between viewer and seller
            let connectionStatus = 'none';

            if (viewerId && !isOwner) {
                const connection = await db.oneOrNone(`
                    SELECT requester_id, receiver_id, status
                    FROM connections
                    WHERE (requester_id = $1 AND receiver_id = $2)
                       OR (requester_id = $2 AND receiver_id = $1)
                `, [viewerId, seller.id]);

                if (connection) {
                    connectionStatus = connection.status;
                }
            }

            res.render('pages/product-detail', {
                title: product.productname,
                userId: viewerId,
                product,
                images,
                seller,
                isOwner,
                connectionStatus
            });

        } catch (error) {
            console.error('Error fetching product details:', error);
            res.render('pages/product-detail', {
                title: 'Error',
                userId: req.session.userId,
                error: 'An error occurred while loading the product.'
            });
        }
    });

    // Delete Product
    router.post('/:id/delete', async (req, res) => {
        try {
            const productId = parseInt(req.params.id, 10);
            const userId = req.session.userId;

            if (!userId) {
                return res.redirect('/login');
            }

            // Check if the user owns this product
            const product = await db.oneOrNone('SELECT user_id FROM Products WHERE id = $1', [productId]);

            if (!product) {
                return res.redirect('/profile');
            }

            if (product.user_id !== userId) {
                return res.status(403).send('Unauthorized');
            }

            // Get all image URLs before deleting
            const images = await db.any(`
                SELECT image_path
                FROM product_images
                WHERE product_id = $1
            `, [productId]);

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

            // Delete the product (CASCADE will handle related records)
            await db.none('DELETE FROM Products WHERE id = $1', [productId]);

            res.redirect('/profile');

        } catch (error) {
            console.error('Error deleting product:', error);
            res.redirect('/profile');
        }
    });

    return router;
};
