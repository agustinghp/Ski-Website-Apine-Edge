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

      // If search query is empty or just whitespace, show all items
      if (searchQuery.trim() === '') {
        // Show all products
        if (searchType === 'all' || searchType === 'products') {
          const productQuery = `
                    SELECT 
                      p.id, p.productName as productname, p.productDescription as productdescription, 
                      p.brand, p.model, p.skiLength as skilength, p.skiWidth as skiwidth, p.price,
                      u.username as seller_name, u.location as seller_location
                    FROM Products p JOIN users u ON p.user_id = u.id
                    ORDER BY p.id DESC
                  `;
          products = await db.any(productQuery);
        }

        // Show all services
        if (searchType === 'all' || searchType === 'services') {
          const serviceQuery = `
                    SELECT 
                      s.id, s.serviceName as servicename, s.serviceDescription as servicedescription, s.price,
                      u.username as provider_name, u.location as provider_location
                    FROM Services s JOIN users u ON s.user_id = u.id
                    ORDER BY s.id DESC
                  `;
          services = await db.any(serviceQuery);
        }
      } else {
        // Search with query pattern
        const searchPattern = `%${searchQuery}%`;

        if (searchType === 'all' || searchType === 'products') {
          const productQuery = `
                    SELECT 
                      p.id, p.productName as productname, p.productDescription as productdescription, 
                      p.brand, p.model, p.skiLength as skilength, p.skiWidth as skiwidth, p.price,
                      u.username as seller_name, u.location as seller_location
                    FROM Products p JOIN users u ON p.user_id = u.id
                    WHERE p.productName ILIKE $1 OR p.productDescription ILIKE $1 OR p.brand ILIKE $1 OR p.model ILIKE $1
                    ORDER BY p.id DESC
                  `;
          products = await db.any(productQuery, [searchPattern]);
        }

        if (searchType === 'all' || searchType === 'services') {
          const serviceQuery = `
                    SELECT 
                      s.id, s.serviceName as servicename, s.serviceDescription as servicedescription, s.price,
                      u.username as provider_name, u.location as provider_location
                    FROM Services s JOIN users u ON s.user_id = u.id
                    WHERE s.serviceName ILIKE $1 OR s.serviceDescription ILIKE $1
                    ORDER BY s.id DESC
                  `;
          services = await db.any(serviceQuery, [searchPattern]);
        }
      }

      // Calculate total results
      const resultCount = products.length + services.length;
      const hasResults = resultCount > 0;

      // Render the search page with results
      res.render('pages/search', {
        title: 'Search Results',
        query: searchQuery,
        searchType: searchType,
        products: products,
        services: services,
        resultCount: resultCount,
        hasResults: hasResults,
        userId: req.session.userId // Pass session data
      });

    } catch (error) {
      console.error('Search error:', error);
      res.render('pages/search', {
        title: 'Search Skis',
        query: req.query.query || '',
        searchType: req.query.type || 'all',
        products: [],
        services: [],
        resultCount: 0,
        hasResults: false,
        userId: req.session.userId,
        error: 'An error occurred while searching. Please try again.'
      });
    }
  });

  return router;
};
