const express = require('express');
const router = express.Router();
const { upload, processProductImage, processServiceImage } = require('../uploadMiddleware');

module.exports = (db, auth) => {

    // Render Create Listing Page
    router.get('/', auth, (req, res) => {
        res.render('pages/create-listing', {
            title: 'Create Listing',
            userId: req.session.userId
        });
    });

    // Handle Product Listing Creation with Images
    router.post('/product', auth, upload.array('productImages', 5), async (req, res) => {
        const { brand, model, productName, productDescription, skiLength, skiWidth, price } = req.body;
        const userId = req.session.userId;

        // Validation: Check required fields
        if (!brand || !model || !productName || !price) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                message: {
                    type: 'danger',
                    text: 'Please fill in all required fields (Brand, Model, Product Name, and Price).'
                }
            });
        }

        try {
            // Insert product first to get the product ID
            const product = await db.one(`
                INSERT INTO Products (user_id, productName, productDescription, brand, model, skiLength, skiWidth, price)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [
                userId,
                productName,
                productDescription,
                brand,
                model,
                skiLength || null,
                skiWidth || null,
                price
            ]);

            const productId = product.id;

            // Process and save images if any were uploaded
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const imagePath = await processProductImage(req.files[i].buffer, productId, i);
                    
                    // Save image path to database
                    await db.none(`
                        INSERT INTO product_images (product_id, image_path, is_primary)
                        VALUES ($1, $2, $3)
                    `, [productId, imagePath, i === 0]); // First image is primary
                }
            }

            res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                message: {
                    type: 'success',
                    text: `Product listing "${productName}" created successfully!`
                }
            });

        } catch (error) {
            console.error('Error creating product listing:', error);
            res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                message: {
                    type: 'danger',
                    text: 'Failed to create product listing. Please try again.'
                }
            });
        }
    });

    // Handle Service Listing Creation with Images
    router.post('/service', auth, upload.array('serviceImages', 5), async (req, res) => {
        const { serviceName, serviceDescription, price } = req.body;
        const userId = req.session.userId;

        // Validation: Check required fields
        if (!serviceName) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'service',
                formData: req.body,
                message: {
                    type: 'danger',
                    text: 'Please provide a service name.'
                }
            });
        }

        try {
            // Insert service first to get the service ID
            const service = await db.one(`
                INSERT INTO Services (user_id, serviceName, serviceDescription, price)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            `, [
                userId,
                serviceName,
                serviceDescription,
                price || null
            ]);

            const serviceId = service.id;

            // Process and save images if any were uploaded
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const imagePath = await processServiceImage(req.files[i].buffer, serviceId, i);
                    
                    // Save image path to database
                    await db.none(`
                        INSERT INTO service_images (service_id, image_path, is_primary)
                        VALUES ($1, $2, $3)
                    `, [serviceId, imagePath, i === 0]); // First image is primary
                }
            }

            res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'service',
                message: {
                    type: 'success',
                    text: `Service listing "${serviceName}" created successfully!`
                }
            });

        } catch (error) {
            console.error('Error creating service listing:', error);
            res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'service',
                formData: req.body,
                message: {
                    type: 'danger',
                    text: 'Failed to create service listing. Please try again.'
                }
            });
        }
    });

    return router;
};
