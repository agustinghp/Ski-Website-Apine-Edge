const express = require('express');
const router = express.Router();

module.exports = (db, auth) => {


    // Render Create Listing Page
    router.get('/', auth, (req, res) => {
        res.render('pages/create-listing', {
            title: 'Create Listing',
            userId: req.session.userId
        });
    });

    // Handle Product Listing Creation
    router.post('/product', auth, async (req, res) => {
        const { brand, model, productName, productDescription, skiLength, skiWidth, price } = req.body;
        const userId = req.session.userId;

        // Validation: Check required fields
        if (!brand || !model || !productName || !price) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',      // ✅ Needed
                formData: req.body,          // ✅ Needed
                message: {
                    type: 'danger',
                    text: 'Please fill in all required fields (Brand, Model, Product Name, and Price).'
                }
            });
        }

        try {
            await db.none(`
          INSERT INTO Products (user_id, productName, productDescription, brand, model, skiLength, skiWidth, price)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

    // Handle Service Listing Creation
    router.post('/service', auth, async (req, res) => {
        const { serviceName, serviceDescription, price } = req.body;
        const userId = req.session.userId;

        // Validation: Check required fields
        if (!serviceName) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'service',    // ✅ Needed
                formData: req.body,        // ✅ Needed
                message: {
                    type: 'danger',
                    text: 'Please provide a service name.'
                }
            });
        }

        try {
            await db.none(`
          INSERT INTO Services (user_id, serviceName, serviceDescription, price)
          VALUES ($1, $2, $3, $4)
        `, [
                userId,
                serviceName,
                serviceDescription,
                price || null
            ]);

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
