// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
require('dotenv').config();
app.use(express.static(path.join(__dirname, 'Homepage', 'public'))); // For Images
// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/Homepage/views/layouts',
    partialsDir: __dirname + '/Homepage/views/partials',
    helpers: {
        // Helper to check equality (used in search.hbs for selected option)
        eq: function(a, b) {
            return a === b;
        }
    }
});

// database configuration
const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'Homepage', 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// *****************************************************
// <!-- Section 4: Routes -->
// *****************************************************

app.get('/', (req, res) => {
  // Add 'pages/' before the view name
  res.render('pages/home', { title: 'Welcome to Alpine Edge!' });
});

// ... (new routes) ...

// Render Login Page
app.get('/login', (req, res) => {
  res.render('pages/login', { title: 'Login' });
});

// Render Register Page
app.get('/register', (req, res) => {
  res.render('pages/register', { title: 'Register' });
});

// Render Search Page with Database Results
app.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.query || '';
    const searchType = req.query.type || 'all';
    
    let products = [];
    let services = [];
    
    // Only search if there's a query
    if (searchQuery.trim()) {
      // Prepare the search pattern for ILIKE (case-insensitive search)
      const searchPattern = `%${searchQuery}%`;
      
      // Search Products if type is 'all' or 'products'
      if (searchType === 'all' || searchType === 'products') {
        const productQuery = `
          SELECT 
            p.id,
            p.productName,
            p.productDescription,
            p.brand,
            p.model,
            p.skiLength,
            p.skiWidth,
            p.price,
            u.username as seller_name,
            u.location as seller_location
          FROM Products p
          JOIN users u ON p.user_id = u.id
          WHERE 
            p.productName ILIKE $1 OR
            p.productDescription ILIKE $1 OR
            p.brand ILIKE $1 OR
            p.model ILIKE $1 OR
            CAST(p.skiLength AS TEXT) ILIKE $1 OR
            CAST(p.skiWidth AS TEXT) ILIKE $1
          ORDER BY p.id DESC
        `;
        
        products = await db.any(productQuery, [searchPattern]);
      }
      
      // Search Services if type is 'all' or 'services'
      if (searchType === 'all' || searchType === 'services') {
        const serviceQuery = `
          SELECT 
            s.id,
            s.serviceName,
            s.serviceDescription,
            s.price,
            u.username as provider_name,
            u.location as provider_location
          FROM Services s
          JOIN users u ON s.user_id = u.id
          WHERE 
            s.serviceName ILIKE $1 OR
            s.serviceDescription ILIKE $1
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
      title: 'Search Skis',
      query: searchQuery,
      searchType: searchType,
      products: products,
      services: services,
      resultCount: resultCount,
      hasResults: hasResults
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
      error: 'An error occurred while searching. Please try again.'
    });
  }
});

// *****************************************************
// <!-- Section 5: Start Server -->
// *****************************************************

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});