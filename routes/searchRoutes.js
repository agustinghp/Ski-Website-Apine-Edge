const express = require('express');
const router = express.Router();

module.exports = (db) => {

  // Render Search Page with Database Results
  router.get('/', async (req, res) => {
    try {
      const searchQuery = req.query.query || '';
      const searchType = req.query.type || 'all';

      let products = [];
      let services = [];
      let users = [];

      // If search query is empty or just whitespace, show all items
      if (searchQuery.trim() === '') {
        // Show all products with images
        if (searchType === 'all' || searchType === 'products') {
          const productQuery = `
            SELECT 
              p.id, p.productName as productname, p.productDescription as productdescription, 
              p.brand, p.model, p.skiLength as skilength, p.skiWidth as skiwidth, p.price,
              u.username as seller_name, u.location as seller_location,
              pi.image_path as primary_image
            FROM Products p 
            JOIN users u ON p.user_id = u.id
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
            ORDER BY p.id DESC
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
            ORDER BY s.id DESC
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
              p.brand, p.model, p.skiLength as skilength, p.skiWidth as skiwidth, p.price,
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
            ORDER BY p.id DESC
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
            ORDER BY s.id DESC
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

  return router;
};
