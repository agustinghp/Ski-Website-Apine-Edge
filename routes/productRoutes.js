const express = require('express');
const router = express.Router();

module.exports = (db) => {

    // Product Detail Page
    router.get('/:id', async (req, res) => {
        try {
            const productId = parseInt(req.params.id, 10);

            if (isNaN(productId)) {
                return res.render('pages/product-detail', {
                    title: 'Product Not Found',
                    userId: req.session.userId,
                    error: 'Invalid product ID.'
                });
            }

            // Get product with seller information
            const product = await db.oneOrNone(`
                SELECT p.*, u.username, u.location, u.created_at as seller_created_at, u.id as seller_id
                FROM Products p
                JOIN users u ON p.user_id = u.id
                WHERE p.id = $1
            `, [productId]);

            if (!product) {
                return res.render('pages/product-detail', {
                    title: 'Product Not Found',
                    userId: req.session.userId,
                    error: 'Product not found.'
                });
            }

            // Create seller object
            const seller = {
                id: product.seller_id,
                username: product.username,
                location: product.location,
                created_at: product.seller_created_at
            };

            // Check if current user is the owner
            const isOwner = req.session.userId === product.user_id;

            res.render('pages/product-detail', {
                title: product.productname,
                userId: req.session.userId,
                product: product,
                seller: seller,
                isOwner: isOwner
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
    return router;
};
