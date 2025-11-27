const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load brands.json
const brandsPath = path.join(__dirname, '..', 'brands.json');
let brandsData = {};
try {
  const brandsFile = fs.readFileSync(brandsPath, 'utf8');
  brandsData = JSON.parse(brandsFile);
  // Remove _meta from brandsData
  delete brandsData._meta;
} catch (error) {
  console.error('Error loading brands.json:', error);
}

// Function to get brands for a specific category
function getBrandsForCategory(category) {
  if (category === 'other') {
    // For "other" category, return all brands
    return Object.keys(brandsData).sort();
  }
  
  if (!category || category === '') {
    // If no category selected, return empty array (user should select a category first)
    return [];
  }
  
  // Filter brands that belong to this category
  const brands = [];
  for (const [brand, categories] of Object.entries(brandsData)) {
    if (Array.isArray(categories) && categories.includes(category)) {
      brands.push(brand);
    }
  }
  
  return brands.sort();
}

module.exports = (db) => {

  // Render Search Page with Database Results
  router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.query || '';
      const searchType = req.query.type || 'all';
      const sortBy = req.query.sortBy || '';

      let products = [];
      let services = [];
      let users = [];

      // Build ORDER BY clause based on sortBy
      let productOrderBy = 'p.id DESC';
      let serviceOrderBy = 's.id DESC';

      if (sortBy === 'price_asc') {
        productOrderBy = 'p.price ASC NULLS LAST, p.id DESC';
        serviceOrderBy = 's.price ASC NULLS LAST, s.id DESC';
      } else if (sortBy === 'price_desc') {
        productOrderBy = 'p.price DESC NULLS LAST, p.id DESC';
        serviceOrderBy = 's.price DESC NULLS LAST, s.id DESC';
      } else if (sortBy === 'length_asc') {
        // Use COALESCE to combine skiLength and snowboardLength for sorting
        productOrderBy = 'COALESCE(p.skiLength, p.snowboardLength) ASC NULLS LAST, p.id DESC';
      } else if (sortBy === 'length_desc') {
        productOrderBy = 'COALESCE(p.skiLength, p.snowboardLength) DESC NULLS LAST, p.id DESC';
      } else if (sortBy === 'width_asc') {
        // Use COALESCE to combine skiWidth and snowboardWidth for sorting
        productOrderBy = 'COALESCE(p.skiWidth, p.snowboardWidth) ASC NULLS LAST, p.id DESC';
      } else if (sortBy === 'width_desc') {
        productOrderBy = 'COALESCE(p.skiWidth, p.snowboardWidth) DESC NULLS LAST, p.id DESC';
      }

      // If search query is empty or just whitespace, show all items
      if (searchQuery.trim() === '') {
        // Show all products with images
        if (searchType === 'all' || searchType === 'products') {
          const productQuery = `
            SELECT 
              p.id, p.productName as productname, p.productDescription as productdescription, 
              p.brand, p.model, p.productType as producttype,
              p.skiLength as skilength, p.skiWidth as skiwidth, 
              p.snowboardLength as snowboardlength, p.snowboardWidth as snowboardwidth,
              p.helmetSize as helmetsize,
              p.bootType as boottype, p.bootSize as bootsize,
              p.polesLength as poleslength,
              p.clothingSize as clothingsize,
              p.price,
              u.username as seller_name, u.location as seller_location,
              pi.image_path as primary_image
            FROM Products p 
            JOIN users u ON p.user_id = u.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
            ORDER BY ${productOrderBy}
          `;
          products = await db.any(productQuery);
        }

        // Show all services with images
        if (searchType === 'all' || searchType === 'services') {
          const serviceQuery = `
            SELECT 
              s.id, s.serviceName as servicename, s.serviceDescription as servicedescription, s.price,
              u.username as provider_name, u.location as provider_location,
              si.image_path as primary_image
            FROM Services s 
            JOIN users u ON s.user_id = u.id
            LEFT JOIN service_images si ON s.id = si.service_id AND si.is_primary = true
            ORDER BY ${serviceOrderBy}
          `;
          services = await db.any(serviceQuery);
        }

        // Show all users with profile pictures
        if (searchType === 'all' || searchType === 'users') {
          const userQuery = `
            SELECT 
              id, username, email, location, profile_image
            FROM users
            ORDER BY id DESC
          `;
          users = await db.any(userQuery);
        }

      } else {
        // Search with query pattern
        const searchPattern = `%${searchQuery}%`;

        if (searchType === 'all' || searchType === 'products') {
          const productQuery = `
            SELECT 
              p.id, p.productName as productname, p.productDescription as productdescription, 
              p.brand, p.model, p.productType as producttype,
              p.skiLength as skilength, p.skiWidth as skiwidth, 
              p.snowboardLength as snowboardlength, p.snowboardWidth as snowboardwidth,
              p.helmetSize as helmetsize,
              p.bootType as boottype, p.bootSize as bootsize,
              p.polesLength as poleslength,
              p.clothingSize as clothingsize,
              p.price,
              u.username as seller_name, u.location as seller_location,
              pi.image_path as primary_image
            FROM Products p 
            JOIN users u ON p.user_id = u.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
            WHERE 
              p.productName ILIKE $1 
              OR p.productDescription ILIKE $1 
              OR p.brand ILIKE $1 
              OR p.model ILIKE $1
            ORDER BY ${productOrderBy}
          `;
          products = await db.any(productQuery, [searchPattern]);
        }

        if (searchType === 'all' || searchType === 'services') {
          const serviceQuery = `
            SELECT 
              s.id, s.serviceName as servicename, s.serviceDescription as servicedescription, s.price,
              u.username as provider_name, u.location as provider_location,
              si.image_path as primary_image
            FROM Services s 
            JOIN users u ON s.user_id = u.id
            LEFT JOIN service_images si ON s.id = si.service_id AND si.is_primary = true
            WHERE 
              s.serviceName ILIKE $1 
              OR s.serviceDescription ILIKE $1
            ORDER BY ${serviceOrderBy}
          `;
          services = await db.any(serviceQuery, [searchPattern]);
        }

        if (searchType === 'all' || searchType === 'users') {
          const userQuery = `
          SELECT 
          id, username, location, profile_image
          FROM users
          WHERE 
          username ILIKE $1
          OR email ILIKE $1
          OR location ILIKE $1
          ORDER BY id DESC
          `;
          users = await db.any(userQuery, [searchPattern]);
        }
      }

      const viewerId = req.session.userId;

      // Remove yourself
      users = users.filter(u => u.id !== viewerId);

      // Add connectionStatus to each user
      for (let u of users) {
        const connection = await db.oneOrNone(`
      SELECT status
      FROM connections
      WHERE 
      (requester_id = $1 AND receiver_id = $2)
      OR
      (requester_id = $2 AND receiver_id = $1)
      `, [viewerId, u.id]);

        u.connectionStatus = connection ? connection.status : 'none';
      }

      const resultCount = products.length + services.length + users.length;
      const hasResults = resultCount > 0;

      // Render the search page with results
      res.render('pages/search', {
        title: 'Search Results',
        query: searchQuery,
        searchType: searchType,
        sortBy: sortBy,
        products: products,
        services: services,
        users: users,
        resultCount: resultCount,
        hasResults: hasResults,
        userId: req.session.userId
      });

    } catch (error) {
      console.error('Search error:', error);
      res.render('pages/search', {
        title: 'Search Skis',
        query: req.query.query || '',
        searchType: req.query.type || 'all',
        sortBy: req.query.sortBy || '',
        products: [],
        services: [],
        users: [],
        resultCount: 0,
        hasResults: false,
        userId: req.session.userId,
        error: 'An error occurred while searching. Please try again.'
      });
    }
  });

  // Advanced Search Page for Products
  router.get('/advanced-search', async (req, res) => {
    try {
      const {
        query: searchQuery = '',
        productType = 'ski',
        minPrice = '',
        maxPrice = '',
        // Ski filters
        minSkiLength = '',
        maxSkiLength = '',
        minSkiWidth = '',
        maxSkiWidth = '',
        // Snowboard filters
        minSnowboardLength = '',
        maxSnowboardLength = '',
        minSnowboardWidth = '',
        maxSnowboardWidth = '',
        // Helmet filters
        minHelmetSize = '',
        maxHelmetSize = '',
        // Boot filters
        bootType = '',
        minBootSize = '',
        maxBootSize = '',
        // Pole filters
        minPoleLength = '',
        maxPoleLength = '',
        // Clothing filters (array)
        clothingSizes = '',
        // Brand filters (array)
        brands = '',
        // Custom brands (array) - all custom brands regardless of selection
        customBrands = '',
        sortBy = ''
      } = req.query;

      // Build ORDER BY clause
      let productOrderBy = 'p.id DESC';
      if (sortBy === 'price_asc') {
        productOrderBy = 'p.price ASC NULLS LAST, p.id DESC';
      } else if (sortBy === 'price_desc') {
        productOrderBy = 'p.price DESC NULLS LAST, p.id DESC';
      } else if (sortBy === 'length_asc') {
        productOrderBy = 'COALESCE(p.skiLength, p.snowboardLength) ASC NULLS LAST, p.id DESC';
      } else if (sortBy === 'length_desc') {
        productOrderBy = 'COALESCE(p.skiLength, p.snowboardLength) DESC NULLS LAST, p.id DESC';
      } else if (sortBy === 'width_asc') {
        productOrderBy = 'COALESCE(p.skiWidth, p.snowboardWidth) ASC NULLS LAST, p.id DESC';
      } else if (sortBy === 'width_desc') {
        productOrderBy = 'COALESCE(p.skiWidth, p.snowboardWidth) DESC NULLS LAST, p.id DESC';
      }

      // Build WHERE conditions dynamically
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Product type filter (required)
      if (productType) {
        conditions.push(`p.productType = $${paramIndex++}`);
        params.push(productType);
      }

      // Text search filter (includes username)
      if (searchQuery.trim()) {
        const searchPattern = `%${searchQuery.trim()}%`;
        conditions.push(`(
          p.productName ILIKE $${paramIndex} 
          OR p.productDescription ILIKE $${paramIndex} 
          OR p.model ILIKE $${paramIndex}
          OR u.username ILIKE $${paramIndex}
        )`);
        params.push(searchPattern);
        paramIndex++;
      }

      // Get available brands from brands.json based on product type
      const availableBrands = getBrandsForCategory(productType);

      // Determine selected brands (default to all if none selected)
      let selectedBrands = Array.isArray(brands) ? brands : (brands ? [brands] : []);
      if (selectedBrands.length === 0 || (selectedBrands.length === 1 && selectedBrands[0] === '')) {
        // If no brands selected, select all available brands by default
        selectedBrands = [...availableBrands];
      }

      // Get custom brands from query parameter (all custom brands, selected or not)
      let allCustomBrands = Array.isArray(customBrands) ? customBrands : (customBrands ? [customBrands] : []);
      allCustomBrands = allCustomBrands.filter(brand => brand && brand.trim() !== '');
      
      // Separate custom brands from selected brands (for filtering)
      const selectedCustomBrands = selectedBrands.filter(brand => !availableBrands.includes(brand));
      const regularSelectedBrands = selectedBrands.filter(brand => availableBrands.includes(brand));

      // Brand filter (multi-select)
      // If custom brands are selected, always filter (even if all regular brands are selected)
      // If only regular brands are selected, only filter if not all are selected
      if (customBrands.length > 0) {
        // Custom brands are selected - filter by all selected brands (regular + custom)
        conditions.push(`p.brand = ANY($${paramIndex}::text[])`);
        params.push(selectedBrands);
        paramIndex++;
      } else if (regularSelectedBrands.length > 0 && regularSelectedBrands.length < availableBrands.length) {
        // Only regular brands selected, and not all of them - filter
        conditions.push(`p.brand = ANY($${paramIndex}::text[])`);
        params.push(regularSelectedBrands);
        paramIndex++;
      }
      // If all regular brands are selected and no custom brands, don't add a filter (show all products)

      // Price range filter
      if (minPrice) {
        conditions.push(`p.price >= $${paramIndex++}`);
        params.push(parseFloat(minPrice));
      }
      if (maxPrice) {
        conditions.push(`p.price <= $${paramIndex++}`);
        params.push(parseFloat(maxPrice));
      }

      // Category-specific filters
      if (productType === 'ski') {
        if (minSkiLength) {
          conditions.push(`p.skiLength >= $${paramIndex++}`);
          params.push(parseFloat(minSkiLength));
        }
        if (maxSkiLength) {
          conditions.push(`p.skiLength <= $${paramIndex++}`);
          params.push(parseFloat(maxSkiLength));
        }
        if (minSkiWidth) {
          conditions.push(`p.skiWidth >= $${paramIndex++}`);
          params.push(parseFloat(minSkiWidth));
        }
        if (maxSkiWidth) {
          conditions.push(`p.skiWidth <= $${paramIndex++}`);
          params.push(parseFloat(maxSkiWidth));
        }
      } else if (productType === 'snowboard') {
        if (minSnowboardLength) {
          conditions.push(`p.snowboardLength >= $${paramIndex++}`);
          params.push(parseFloat(minSnowboardLength));
        }
        if (maxSnowboardLength) {
          conditions.push(`p.snowboardLength <= $${paramIndex++}`);
          params.push(parseFloat(maxSnowboardLength));
        }
        if (minSnowboardWidth) {
          conditions.push(`p.snowboardWidth >= $${paramIndex++}`);
          params.push(parseFloat(minSnowboardWidth));
        }
        if (maxSnowboardWidth) {
          conditions.push(`p.snowboardWidth <= $${paramIndex++}`);
          params.push(parseFloat(maxSnowboardWidth));
        }
      } else if (productType === 'helmet') {
        if (minHelmetSize) {
          conditions.push(`p.helmetSize >= $${paramIndex++}`);
          params.push(parseFloat(minHelmetSize));
        }
        if (maxHelmetSize) {
          conditions.push(`p.helmetSize <= $${paramIndex++}`);
          params.push(parseFloat(maxHelmetSize));
        }
      } else if (productType === 'boots') {
        if (bootType) {
          conditions.push(`p.bootType = $${paramIndex++}`);
          params.push(bootType);
        }
        if (minBootSize) {
          conditions.push(`p.bootSize >= $${paramIndex++}`);
          params.push(parseFloat(minBootSize));
        }
        if (maxBootSize) {
          conditions.push(`p.bootSize <= $${paramIndex++}`);
          params.push(parseFloat(maxBootSize));
        }
      } else if (productType === 'poles') {
        if (minPoleLength) {
          conditions.push(`p.polesLength >= $${paramIndex++}`);
          params.push(parseFloat(minPoleLength));
        }
        if (maxPoleLength) {
          conditions.push(`p.polesLength <= $${paramIndex++}`);
          params.push(parseFloat(maxPoleLength));
        }
      } else if (['goggles', 'gloves', 'jackets', 'pants'].includes(productType)) {
        if (clothingSizes) {
          // Handle multiple sizes - clothingSizes can be a string or array
          const sizes = Array.isArray(clothingSizes) ? clothingSizes : [clothingSizes];
          if (sizes.length > 0 && sizes[0] !== '') {
            conditions.push(`p.clothingSize = ANY($${paramIndex}::text[])`);
            params.push(sizes);
            paramIndex++;
          }
        }
      }

      // Build the final query
      let productQuery = `
        SELECT 
          p.id, p.productName as productname, p.productDescription as productdescription, 
          p.brand, p.model, p.productType as producttype,
          p.skiLength as skilength, p.skiWidth as skiwidth, 
          p.snowboardLength as snowboardlength, p.snowboardWidth as snowboardwidth,
          p.helmetSize as helmetsize,
          p.bootType as boottype, p.bootSize as bootsize,
          p.polesLength as poleslength,
          p.clothingSize as clothingsize,
          p.price,
          u.username as seller_name, u.location as seller_location,
          pi.image_path as primary_image
        FROM Products p 
        JOIN users u ON p.user_id = u.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      `;

      if (conditions.length > 0) {
        productQuery += ` WHERE ${conditions.join(' AND ')}`;
      }

      productQuery += ` ORDER BY ${productOrderBy}`;

      // Print the final query and parameters for debugging
      console.log('\n=== ADVANCED SEARCH QUERY ===');
      console.log('SQL Query:', productQuery);
      console.log('Parameters:', params);
      console.log('=============================\n');

      const products = await db.any(productQuery, params);

      // Render the advanced search page
      res.render('pages/advanced-search', {
        title: 'Advanced Search',
        query: searchQuery,
        productType: productType,
        minPrice: minPrice,
        maxPrice: maxPrice,
        minSkiLength: minSkiLength,
        maxSkiLength: maxSkiLength,
        minSkiWidth: minSkiWidth,
        maxSkiWidth: maxSkiWidth,
        minSnowboardLength: minSnowboardLength,
        maxSnowboardLength: maxSnowboardLength,
        minSnowboardWidth: minSnowboardWidth,
        maxSnowboardWidth: maxSnowboardWidth,
        minHelmetSize: minHelmetSize,
        maxHelmetSize: maxHelmetSize,
        bootType: bootType,
        minBootSize: minBootSize,
        maxBootSize: maxBootSize,
        minPoleLength: minPoleLength,
        maxPoleLength: maxPoleLength,
        clothingSizes: Array.isArray(clothingSizes) ? clothingSizes : (clothingSizes ? [clothingSizes] : []),
        brands: selectedBrands,
        customBrands: allCustomBrands,
        availableBrands: availableBrands,
        sortBy: sortBy,
        products: products,
        resultCount: products.length,
        hasResults: products.length > 0,
        userId: req.session.userId
      });

    } catch (error) {
      console.error('Advanced search error:', error);
      res.render('pages/advanced-search', {
        title: 'Advanced Search',
        query: req.query.query || '',
        productType: req.query.productType || '',
        products: [],
        resultCount: 0,
        hasResults: false,
        userId: req.session.userId,
        error: 'An error occurred while searching. Please try again.'
      });
    }
  });

  // API endpoint to get brands for a category
  router.get('/api/brands/:category', (req, res) => {
    try {
      const category = req.params.category || '';
      const brands = getBrandsForCategory(category);
      res.json({ brands });
    } catch (error) {
      console.error('Error getting brands:', error);
      res.status(500).json({ error: 'Failed to get brands' });
    }
  });

  return router;
};
