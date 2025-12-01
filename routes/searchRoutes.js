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
  delete brandsData._meta;
} catch (error) {
  console.error('Error loading brands.json:', error);
}

// Function to get brands for a specific category
function getBrandsForCategory(category) {
  if (category === 'other') return Object.keys(brandsData).sort();
  if (!category || category === '') return [];
  const brands = [];
  for (const [brand, categories] of Object.entries(brandsData)) {
    if (Array.isArray(categories) && categories.includes(category)) {
      brands.push(brand);
    }
  }
  return brands.sort();
}

// Helper: Haversine SQL
// Security: Rounds other users' coordinates to 3 decimal places (~111m accuracy)
// to prevent exact location tracking while maintaining reasonable distance calculations
const getHaversineDistance = (lat, lng, tableAlias = 'u') => {
  return `( 3959 * acos( cos( radians(${lat}) ) * cos( radians( ROUND(${tableAlias}.latitude::numeric, 3) ) ) 
    * cos( radians( ROUND(${tableAlias}.longitude::numeric, 3) ) - radians(${lng}) ) + sin( radians(${lat}) ) 
    * sin( radians( ROUND(${tableAlias}.latitude::numeric, 3) ) ) ) )`;
};

module.exports = (db) => {

  // ==========================================
  // 1. ADVANCED SEARCH PAGE
  // ==========================================
  router.get('/advanced-search', async (req, res) => {
    try {
      const currentUserId = req.session.userId;
      
      const {
        query: searchQuery = '',
        productType = 'ski',
        minPrice = '', maxPrice = '',
        // Filters
        minSkiLength = '', maxSkiLength = '', minSkiWidth = '', maxSkiWidth = '',
        minSnowboardLength = '', maxSnowboardLength = '', minSnowboardWidth = '', maxSnowboardWidth = '',
        minHelmetSize = '', maxHelmetSize = '',
        bootType = '', minBootSize = '', maxBootSize = '',
        minPoleLength = '', maxPoleLength = '',
        clothingSizes = '', brands = '', customBrands = '',
        sortBy = '',
        // Location params (from the new input)
        lat, lng, radius, locationName,
        // UI state
        brandsExpanded = ''
      } = req.query;

      // --- 1. Determine Location ---
      let searchLat = parseFloat(lat);
      let searchLng = parseFloat(lng);
      let displayLocation = locationName || ''; 

      // Check if user manually entered a location (Autocompleted)
      let usingCustomLocation = !isNaN(searchLat) && !isNaN(searchLng);

      // If NO manual location, fall back to User's DB Location
      if (!usingCustomLocation && currentUserId) {
        const currentUser = await db.oneOrNone('SELECT latitude, longitude, location FROM users WHERE id = $1', [currentUserId]);
        if (currentUser && currentUser.latitude) {
            searchLat = parseFloat(currentUser.latitude);
            searchLng = parseFloat(currentUser.longitude);
            // If we don't have a display name yet, use the one from DB
            if (!displayLocation) displayLocation = currentUser.location;
        }
      }

      const hasLocation = !isNaN(searchLat) && !isNaN(searchLng);

      // --- 2. Build Sort Logic ---
      let productOrderBy = 'p.id DESC';
      if (sortBy === 'price_asc') productOrderBy = 'p.price ASC NULLS LAST, p.id DESC';
      else if (sortBy === 'price_desc') productOrderBy = 'p.price DESC NULLS LAST, p.id DESC';
      else if (hasLocation && !sortBy) productOrderBy = 'distance ASC'; // Default to distance
      else if (sortBy === 'length_asc') productOrderBy = 'COALESCE(p.skiLength, p.snowboardLength) ASC NULLS LAST, p.id DESC';
      else if (sortBy === 'length_desc') productOrderBy = 'COALESCE(p.skiLength, p.snowboardLength) DESC NULLS LAST, p.id DESC';

      // --- 3. Build WHERE Conditions ---
      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Distance Filter
      let distanceSelect = '';
      if (hasLocation) {
        const distCalc = getHaversineDistance(searchLat, searchLng, 'u');
        distanceSelect = `, ROUND((${distCalc})::numeric, 1) as distance`;
        
        if (radius) {
          conditions.push(`${distCalc} <= $${paramIndex++}`);
          params.push(parseFloat(radius));
        }
      }

      // Product Type
      if (productType) {
        conditions.push(`p.productType = $${paramIndex++}`);
        params.push(productType);
      }

      // Text Search
      if (searchQuery.trim()) {
        const searchPattern = `%${searchQuery.trim()}%`;
        conditions.push(`(p.productName ILIKE $${paramIndex} OR p.productDescription ILIKE $${paramIndex} OR p.model ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex})`);
        params.push(searchPattern);
        paramIndex++;
      }

      // Brands
      const availableBrands = getBrandsForCategory(productType);
      let selectedBrands = Array.isArray(brands) ? brands : (brands ? [brands] : []);
      let allCustomBrands = Array.isArray(customBrands) ? customBrands : (customBrands ? [customBrands] : []);
      allCustomBrands = allCustomBrands.filter(b => b && b.trim() !== '');
      
      // If no brands are selected, select all available brands by default
      if (selectedBrands.length === 0 && availableBrands.length > 0) {
        selectedBrands = [...availableBrands];
      }
      
      const brandsToFilter = [...selectedBrands.filter(b => availableBrands.includes(b)), ...allCustomBrands];
      
      // Only filter by brands if not all brands are selected (or if there are custom brands)
      // If all available brands are selected, don't add the filter (show all brands)
      if (brandsToFilter.length > 0 && (brandsToFilter.length < availableBrands.length || allCustomBrands.length > 0)) {
         conditions.push(`p.brand = ANY($${paramIndex}::text[])`);
         params.push(brandsToFilter);
         paramIndex++;
      }

      // Price & Specs
      if (minPrice) { conditions.push(`p.price >= $${paramIndex++}`); params.push(parseFloat(minPrice)); }
      if (maxPrice) { conditions.push(`p.price <= $${paramIndex++}`); params.push(parseFloat(maxPrice)); }

      // Category Specifics (Existing Logic)
      if (productType === 'ski') {
        if (minSkiLength) { conditions.push(`p.skiLength >= $${paramIndex++}`); params.push(parseFloat(minSkiLength)); }
        if (maxSkiLength) { conditions.push(`p.skiLength <= $${paramIndex++}`); params.push(parseFloat(maxSkiLength)); }
        if (minSkiWidth) { conditions.push(`p.skiWidth >= $${paramIndex++}`); params.push(parseFloat(minSkiWidth)); }
        if (maxSkiWidth) { conditions.push(`p.skiWidth <= $${paramIndex++}`); params.push(parseFloat(maxSkiWidth)); }
      } else if (productType === 'snowboard') {
        if (minSnowboardLength) { conditions.push(`p.snowboardLength >= $${paramIndex++}`); params.push(parseFloat(minSnowboardLength)); }
        if (maxSnowboardLength) { conditions.push(`p.snowboardLength <= $${paramIndex++}`); params.push(parseFloat(maxSnowboardLength)); }
        if (minSnowboardWidth) { conditions.push(`p.snowboardWidth >= $${paramIndex++}`); params.push(parseFloat(minSnowboardWidth)); }
        if (maxSnowboardWidth) { conditions.push(`p.snowboardWidth <= $${paramIndex++}`); params.push(parseFloat(maxSnowboardWidth)); }
      } else if (productType === 'helmet') {
        if (minHelmetSize) { conditions.push(`p.helmetSize >= $${paramIndex++}`); params.push(parseFloat(minHelmetSize)); }
        if (maxHelmetSize) { conditions.push(`p.helmetSize <= $${paramIndex++}`); params.push(parseFloat(maxHelmetSize)); }
      } else if (productType === 'boots') {
        if (bootType) { conditions.push(`p.bootType = $${paramIndex++}`); params.push(bootType); }
        if (minBootSize) { conditions.push(`p.bootSize >= $${paramIndex++}`); params.push(parseFloat(minBootSize)); }
        if (maxBootSize) { conditions.push(`p.bootSize <= $${paramIndex++}`); params.push(parseFloat(maxBootSize)); }
      } else if (productType === 'poles') {
        if (minPoleLength) { conditions.push(`p.polesLength >= $${paramIndex++}`); params.push(parseFloat(minPoleLength)); }
        if (maxPoleLength) { conditions.push(`p.polesLength <= $${paramIndex++}`); params.push(parseFloat(maxPoleLength)); }
      } else if (['goggles', 'gloves', 'jackets', 'pants'].includes(productType)) {
        if (clothingSizes) {
          const sizes = Array.isArray(clothingSizes) ? clothingSizes : [clothingSizes];
          if (sizes.length > 0 && sizes[0] !== '') {
            conditions.push(`p.clothingSize = ANY($${paramIndex}::text[])`);
            params.push(sizes);
            paramIndex++;
          }
        }
      }

      // Execute Query
      let productQuery = `
        SELECT p.*, 
        u.username as seller_name, u.location as seller_location,
        pi.image_path as primary_image
        ${distanceSelect}
        FROM Products p 
        JOIN users u ON p.user_id = u.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      `;
      if (conditions.length > 0) productQuery += ` WHERE ${conditions.join(' AND ')}`;
      productQuery += ` ORDER BY ${productOrderBy}`;

      const products = await db.any(productQuery, params);

      res.render('pages/advanced-search', {
        title: 'Advanced Search',
        // Search Params
        query: searchQuery, productType, radius, 
        // Location Data (Pass back so fields stay populated)
        lat: usingCustomLocation ? searchLat : '', 
        lng: usingCustomLocation ? searchLng : '',
        locationName: displayLocation,
        hasLocation,
        // Filters
        minPrice, maxPrice,
        minSkiLength, maxSkiLength, minSkiWidth, maxSkiWidth,
        clothingSizes: Array.isArray(clothingSizes) ? clothingSizes : (clothingSizes ? [clothingSizes] : []),
        brands: selectedBrands, customBrands: allCustomBrands, availableBrands,
        sortBy,
        // UI state
        brandsExpanded: brandsExpanded === 'true' ? 'true' : '',
        products, resultCount: products.length, hasResults: products.length > 0,
        userId: currentUserId
      });

    } catch (error) {
      console.error('Advanced search error:', error);
      res.render('pages/advanced-search', {
        title: 'Advanced Search', products: [], resultCount: 0, hasResults: false,
        error: 'An error occurred.'
      });
    }
  });

  // ==========================================
  // 2. REGULAR SEARCH PAGE
  // ==========================================
  router.get('/', async (req, res) => {
    try {
      const currentUserId = req.session.userId;
      
      // Default Location Logic for Regular Search (User's Profile)
      let userLat = null;
      let userLng = null;
      
      if (currentUserId) {
        const currentUser = await db.oneOrNone('SELECT latitude, longitude FROM users WHERE id = $1', [currentUserId]);
        if (currentUser && currentUser.latitude) {
            userLat = parseFloat(currentUser.latitude);
            userLng = parseFloat(currentUser.longitude);
        }
      }

      const searchQuery = req.query.query || '';
      const searchType = req.query.type || 'all';
      const radius = parseFloat(req.query.radius) || 50; 
      const hasLocation = userLat !== null && userLng !== null;

      let productOrderBy = 'p.id DESC';
      let serviceOrderBy = 's.id DESC';
      let userOrderBy = 'u.id DESC';

      if (hasLocation) {
        productOrderBy = 'distance ASC';
        serviceOrderBy = 'distance ASC';
        userOrderBy = 'distance ASC';
      }

      let distanceSelect = '';
      let distanceWhere = '';

      if (hasLocation) {
        const distCalc = getHaversineDistance(userLat, userLng, 'u');
        distanceSelect = `, ROUND((${distCalc})::numeric, 1) as distance`;
        distanceWhere = ` AND ${distCalc} < ${radius}`;
      }

      const searchPattern = `%${searchQuery.trim()}%`;
      const params = searchQuery.trim() === '' ? [] : [searchPattern];
      const searchPlaceholder = searchQuery.trim() === '' ? '' : '$1';

      let products = [], services = [], users = [];

      // --- PRODUCTS ---
      if (searchType === 'all' || searchType === 'products') {
        let whereClause = '1=1'; 
        if (searchQuery.trim() !== '') {
          whereClause += ` AND (p.productName ILIKE ${searchPlaceholder} OR p.productDescription ILIKE ${searchPlaceholder} OR p.brand ILIKE ${searchPlaceholder})`;
        }
        whereClause += distanceWhere;

        const productQuery = `
          SELECT p.*, u.username as seller_name, u.location as seller_location, pi.image_path as primary_image
          ${distanceSelect}
          FROM Products p JOIN users u ON p.user_id = u.id
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
          WHERE ${whereClause} ORDER BY ${productOrderBy}
        `;
        products = await db.any(productQuery, params);
      }

      // --- SERVICES ---
      if (searchType === 'all' || searchType === 'services') {
        let whereClause = '1=1';
        if (searchQuery.trim() !== '') {
          whereClause += ` AND (s.serviceName ILIKE ${searchPlaceholder} OR s.serviceDescription ILIKE ${searchPlaceholder})`;
        }
        whereClause += distanceWhere;

        const serviceQuery = `
          SELECT s.*, u.username as provider_name, u.location as provider_location, si.image_path as primary_image
          ${distanceSelect}
          FROM Services s JOIN users u ON s.user_id = u.id
          LEFT JOIN service_images si ON s.id = si.service_id AND si.is_primary = true
          WHERE ${whereClause} ORDER BY ${serviceOrderBy}
        `;
        services = await db.any(serviceQuery, params);
      }

      // --- USERS ---
      if (searchType === 'all' || searchType === 'users') {
        let whereClause = '1=1';
        if (searchQuery.trim() !== '') {
           whereClause += ` AND (u.username ILIKE ${searchPlaceholder} OR u.location ILIKE ${searchPlaceholder})`;
        }
        whereClause += distanceWhere;

        const userQuery = `
          SELECT u.id, u.username, u.location, u.profile_image ${distanceSelect}
          FROM users u WHERE ${whereClause} ORDER BY ${userOrderBy}
        `;
        users = await db.any(userQuery, params);
      }

      if (users.length > 0) users = users.filter(u => u.id !== currentUserId);

      const resultCount = products.length + services.length + users.length;

      res.render('pages/search', {
        title: 'Search',
        query: searchQuery, searchType, radius, hasLocation,
        products, services, users,
        resultCount, hasResults: resultCount > 0,
        userId: currentUserId
      });

    } catch (error) {
      console.error('Search error:', error);
      res.render('pages/search', { title: 'Search', products: [], hasResults: false });
    }
  });

  router.get('/api/brands/:category', (req, res) => {
    try { res.json({ brands: getBrandsForCategory(req.params.category || '') }); } 
    catch (error) { res.status(500).json({ error: 'Failed' }); }
  });

  return router;
};