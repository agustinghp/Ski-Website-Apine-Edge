const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { upload, processProductImage, processServiceImage } = require('../uploadMiddleware');

// Load brands from JSON file
function loadBrands() {
    try {
        const brandsPath = path.join(__dirname, '..', 'brands.json');
        const brandsData = JSON.parse(fs.readFileSync(brandsPath, 'utf8'));
        // Remove _meta field and return only brand data
        const { _meta, ...brands } = brandsData;
        return brands;
    } catch (error) {
        console.error('Error loading brands.json:', error);
        // Return empty object if file can't be loaded
        return {};
    }
}

// Format brands for template (convert arrays to comma-separated strings)
function formatBrandsForTemplate(brands) {
    const formatted = {};
    for (const [brandName, categories] of Object.entries(brands)) {
        if (Array.isArray(categories)) {
            formatted[brandName] = categories.join(',');
        } else {
            formatted[brandName] = categories;
        }
    }
    return formatted;
}

module.exports = (db, auth) => {
    // Load brands once when module is initialized
    const rawBrands = loadBrands();
    const brands = formatBrandsForTemplate(rawBrands);

    // Render Create Listing Page
    router.get('/', auth, (req, res) => {
        res.render('pages/create-listing', {
            title: 'Create Listing',
            userId: req.session.userId,
            brands: brands
        });
    });

    // Handle Product Listing Creation with Images
    router.post('/product', auth, upload.array('productImages', 5), async (req, res) => {
        const { brand, customBrand, model, productName, productDescription, productType, skiLength, skiWidth, snowboardLength, snowboardWidth, helmetSize, bootType, bootSize, polesLength, clothingSize, price } = req.body;
        const userId = req.session.userId;

        // Character limits
        const MAX_BRAND_LENGTH = 50;
        const MAX_PRODUCT_NAME_LENGTH = 50;
        const MAX_MODEL_LENGTH = 50;
        const MAX_DESCRIPTION_LENGTH = 5000;

        // Handle brand: use customBrand if "Other" is selected, otherwise use brand
        let finalBrand = '';
        if (brand === 'Other') {
            // Use custom brand if "Other" is selected
            const trimmedCustomBrand = customBrand && typeof customBrand === 'string' ? customBrand.trim() : '';
            if (!trimmedCustomBrand) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: 'Custom brand is required when "Other" is selected. Please enter a brand name.'
                    }
                });
            }
            if (trimmedCustomBrand.length > MAX_BRAND_LENGTH) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: `Custom brand cannot exceed ${MAX_BRAND_LENGTH} characters.`
                    }
                });
            }
            finalBrand = trimmedCustomBrand;
        } else {
            // Use selected brand from dropdown
            finalBrand = brand && typeof brand === 'string' ? brand.trim() : '';
        }

        // Trim and normalize fields
        const trimmedBrand = finalBrand;
        const trimmedProductName = productName && typeof productName === 'string' ? productName.trim() : '';
        const normalizedModel = (model && typeof model === 'string' && model.trim()) || null;
        const normalizedProductType = (productType && typeof productType === 'string' && productType.trim()) || 'ski';
        const normalizedBootType = (bootType && typeof bootType === 'string' && bootType.trim()) || null;
        const trimmedDescription = productDescription && typeof productDescription === 'string' ? productDescription.trim() : null;

        // Validation: Check required fields (after trimming)
        if (!trimmedBrand) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: 'Brand is required. Please select a brand from the list or choose "Other" to enter a custom brand.'
                }
            });
        }

        if (!trimmedProductName) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: 'Product Name is required and cannot be empty or contain only spaces.'
                }
            });
        }

        if (!price) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: 'Price is required.'
                }
            });
        }

        // Validation: Check character limits
        if (trimmedBrand.length > MAX_BRAND_LENGTH) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: `Brand cannot exceed ${MAX_BRAND_LENGTH} characters.`
                }
            });
        }

        if (trimmedProductName.length > MAX_PRODUCT_NAME_LENGTH) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: `Product Name cannot exceed ${MAX_PRODUCT_NAME_LENGTH} characters.`
                }
            });
        }

        if (normalizedModel && normalizedModel.length > MAX_MODEL_LENGTH) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: `Model cannot exceed ${MAX_MODEL_LENGTH} characters.`
                }
            });
        }

        if (trimmedDescription && trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
                }
            });
        }

        // Validation: Check for scientific notation in price
        const priceStr = String(price).trim();
        if (/[eE]/.test(priceStr)) {
            return res.render('pages/create-listing', {
                title: 'Create Listing',
                userId,
                listingType: 'product',
                formData: req.body,
                brands: brands,
                message: {
                    type: 'danger',
                    text: 'Price cannot use scientific notation. Please enter a regular number.'
                }
            });
        }

        // Validation: Check required dimension fields based on product type
        if (normalizedProductType === 'ski') {
            if (!skiLength || !skiWidth) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: 'Please fill in all required fields (Ski Length and Ski Width).'
                    }
                });
            }
        } else if (normalizedProductType === 'snowboard') {
            if (!snowboardLength || !snowboardWidth) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: 'Please fill in all required fields (Snowboard Length and Snowboard Width).'
                    }
                });
            }
        } else if (normalizedProductType === 'helmet') {
            if (!helmetSize) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: 'Please fill in the required field (Helmet Size).'
                    }
                });
            }
        } else if (normalizedProductType === 'boots') {
            if (!bootType || !bootSize) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: 'Please fill in all required fields (Boot Type and Boot Size).'
                    }
                });
            }
            
            // Validate boot size range
            const bootSizeValue = parseFloat(bootSize);
            const MIN_BOOT_SIZE = 3;
            const MAX_BOOT_SIZE = 16;
            if (isNaN(bootSizeValue) || bootSizeValue < MIN_BOOT_SIZE || bootSizeValue > MAX_BOOT_SIZE) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: `Boot Size must be between ${MIN_BOOT_SIZE} and ${MAX_BOOT_SIZE} (US size).`
                    }
                });
            }
        } else if (normalizedProductType === 'poles') {
            if (!polesLength) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: 'Please fill in the required field (Pole Length).'
                    }
                });
            }
        } else if (['goggles', 'gloves', 'jackets', 'pants'].includes(normalizedProductType)) {
            if (!clothingSize) {
                return res.render('pages/create-listing', {
                    title: 'Create Listing',
                    userId,
                    listingType: 'product',
                    formData: req.body,
                    brands: brands,
                    message: {
                        type: 'danger',
                        text: 'Please select a size.'
                    }
                });
            }
        }
        // 'other' type doesn't need validation

        try {
            // Insert product first to get the product ID (using trimmed values)
            const product = await db.one(`
                INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, skiLength, skiWidth, snowboardLength, snowboardWidth, helmetSize, bootType, bootSize, polesLength, clothingSize, price)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING id
            `, [
                userId,
                trimmedProductName,
                trimmedDescription || null,
                trimmedBrand,
                normalizedModel,
                normalizedProductType,
                normalizedProductType === 'ski' ? parseFloat(skiLength) : null,
                normalizedProductType === 'ski' ? parseFloat(skiWidth) : null,
                normalizedProductType === 'snowboard' ? parseFloat(snowboardLength) : null,
                normalizedProductType === 'snowboard' ? parseFloat(snowboardWidth) : null,
                normalizedProductType === 'helmet' ? parseFloat(helmetSize) : null,
                normalizedProductType === 'boots' ? normalizedBootType : null,
                normalizedProductType === 'boots' ? parseFloat(bootSize) : null,
                normalizedProductType === 'poles' ? parseFloat(polesLength) : null,
                (['goggles', 'gloves', 'jackets', 'pants'].includes(normalizedProductType)) ? clothingSize : null,
                parseFloat(price)
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
                brands: brands,
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
                brands: brands,
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
                brands: brands,
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
                brands: brands,
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
                brands: brands,
                message: {
                    type: 'danger',
                    text: 'Failed to create service listing. Please try again.'
                }
            });
        }
    });

    return router;
};
