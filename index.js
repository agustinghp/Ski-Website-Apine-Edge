// *****************************************************
// // *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcryptjs'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server.
require('dotenv').config();

// http and socket.io
const http = require('http');
const server = http.createServer(app); // Create an HTTP server from the Express app
const { Server } = require("socket.io");
const io = new Server(server); // Attach socket.io to the HTTP server

app.use(express.static(path.join(__dirname, 'Homepage', 'public'))); // For Images

// *****************************************************
// // *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/Homepage/views/layouts',
  partialsDir: __dirname + '/Homepage/views/partials',
  helpers: {
    // Equality
    eq: function (a, b) {
      return a === b;
    },

    // Logical AND
    and: function (a, b) {
      return a && b;
    },

    // Logical OR
    or: function (a, b) {
      return a || b;
    },

    // Logical NOT
    not: function (value) {
      return !value;
    },

    // Format date
    formatDate: function (date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    // Substring helper
    substring: function (str, start, end) {
      if (!str) return '';
      return str.substring(start, end).toUpperCase();
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
// // *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'Homepage', 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
const sessionMiddleware = session({ // <-- Define the middleware as a constant
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false,
});

app.use(sessionMiddleware); // <-- Use the constant here

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Authentication middleware
// This ensures that only logged-in users can access certain pages.
const auth = (req, res, next) => {
  if (!req.session.userId) {
    // Redirect to login if not authenticated
    return res.redirect('/login');
  }
  next();
};

// Load User Routes
const userRoutes = require('./routes/userRoutes')(db, auth);
app.use('/users', userRoutes);




// *****************************************************
// // *****************************************************

app.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Welcome to Alpine Edge!',
    userId: req.session.userId // Pass session data to navbar
  });
});

// Render Login Page
app.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Login',
    userId: req.session.userId
  });
});

// Render Register Page
app.get('/register', (req, res) => {
  res.render('pages/register', {
    title: 'Register',
    userId: req.session.userId
  });
});

// Handle Register Form Submission
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Failure case 1: Missing fields
  if (!username || !email || !password) {
    return res.render('pages/register', {
      title: 'Register',
      userId: req.session.userId,
      message: {
        type: 'danger',
        text: 'Username, email, and password are required.'
      }
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.none(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, hash]
    );

    // Success case!
    // Set the session and redirect to homepage
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    
    // Save session before redirect to ensure it's persisted
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
      }
      return res.redirect('/');
    });

  } catch (error) {
    // Failure case 2: Database error (e.g., duplicate user)
    console.error('Registration error:', error);
    res.render('pages/register', {
      title: 'Register',
      userId: req.session.userId,
      message: {
        type: 'danger',
        text: 'Registration failed. Username or email may already be in use.'
      }
    });
  }
});

/// Handle Login Form Submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Failure case 1: Missing fields
  if (!username || !password) {
    return res.render('pages/login', {
      title: 'Login',
      userId: req.session.userId,
      message: {
        type: 'danger',
        text: 'Username and password are required.'
      }
    });
  }

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    // Failure case 2: User not found
    if (!user) {
      return res.render('pages/login', {
        title: 'Login',
        userId: req.session.userId,
        message: {
          type: 'danger',
          text: 'Incorrect username or password.'
        }
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      // **********************************
      // // **********************************

      // 1. Set the session
      req.session.userId = user.id;
      req.session.username = user.username;

      // 2. Redirect to homepage after successful login
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
        return res.redirect('/');
      });

    } else {
      // Failure case 3: Wrong password
      return res.render('pages/login', {
        title: 'Login',
        userId: req.session.userId,
        message: {
          type: 'danger',
          text: 'Incorrect username or password.'
        }
      });
    }

  } catch (error) {
    // Failure case 4: Server error
    console.error('Login error:', error);
    res.render('pages/login', {
      title: 'Login',
      userId: req.session.userId,
      message: {
        type: 'danger',
        text: 'An error occurred. Please try again.'
      }
    });
  }
});

// Handle Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log('Error destroying session:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.get('/profile', auth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;

    // 1. Get User Info
    const user = await db.one('SELECT id, username, email, location FROM users WHERE id = $1', [currentUserId]);

    // 2. Get Connections (Same query as chat page)
    const connections = await db.any(`
            SELECT 
                u.id AS user_id, 
                u.username
            FROM connections c
            JOIN users u ON 
                CASE
                    WHEN c.requester_id = $1 THEN c.receiver_id = u.id
                    WHEN c.receiver_id = $1 THEN c.requester_id = u.id
                END
            WHERE 
                (c.requester_id = $1 OR c.receiver_id = $1) 
                AND c.status = 'accepted'
                AND u.id != $1;
        `, [currentUserId]);

    // 3. Get User's Products
    const products = await db.any('SELECT * FROM Products WHERE user_id = $1 ORDER BY id DESC', [currentUserId]);

    // 4. Get User's Services
    const services = await db.any('SELECT * FROM Services WHERE user_id = $1 ORDER BY id DESC', [currentUserId]);

    // 5. Render the page
    res.render('pages/profile', {
      title: 'My Profile',
      userId: currentUserId,
      user: user,
      connections: connections,
      products: products,
      services: services
    });

  } catch (error) {
    console.error('Error fetching profile page:', error);
    res.render('pages/home', {
      title: 'Error',
      error: 'Could not load your profile.',
      userId: req.session.userId
    });
  }
});

// Render Search Page with Database Results
app.get('/search', async (req, res) => {
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


// Render Create Listing Page
app.get('/create-listing', auth, (req, res) => {
  res.render('pages/create-listing', {
    title: 'Create Listing',
    userId: req.session.userId
  });
});

// Handle Product Listing Creation
app.post('/create-listing/product', auth, async (req, res) => {
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
app.post('/create-listing/service', auth, async (req, res) => {
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

// Product Detail Page
app.get('/products/:id', async (req, res) => {
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

// Service Detail Page
app.get('/services/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id, 10);

    if (isNaN(serviceId)) {
      return res.render('pages/service-detail', {
        title: 'Service Not Found',
        userId: req.session.userId,
        error: 'Invalid service ID.'
      });
    }

    // Get service with provider information
    const service = await db.oneOrNone(`
            SELECT s.*, u.username, u.location, u.created_at as provider_created_at, u.id as provider_id
            FROM Services s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `, [serviceId]);

    if (!service) {
      return res.render('pages/service-detail', {
        title: 'Service Not Found',
        userId: req.session.userId,
        error: 'Service not found.'
      });
    }

    // Create provider object
    const provider = {
      id: service.provider_id,
      username: service.username,
      location: service.location,
      created_at: service.provider_created_at
    };

    // Check if current user is the owner
    const isOwner = req.session.userId === service.user_id;

    res.render('pages/service-detail', {
      title: service.servicename,
      userId: req.session.userId,
      service: service,
      provider: provider,
      isOwner: isOwner
    });

  } catch (error) {
    console.error('Error fetching service details:', error);
    res.render('pages/service-detail', {
      title: 'Error',
      userId: req.session.userId,
      error: 'An error occurred while loading the service.'
    });
  }
});

// GET /chat - Renders the chat page
app.get('/chat', auth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;

    const connections = await db.any(`
            SELECT 
                u.id AS user_id, 
                u.username
            FROM connections c
            JOIN users u ON 
                CASE
                    WHEN c.requester_id = $1 THEN c.receiver_id = u.id
                    WHEN c.receiver_id = $1 THEN c.requester_id = u.id
                END
            WHERE 
                (c.requester_id = $1 OR c.receiver_id = $1) 
                AND c.status = 'accepted'
                AND u.id != $1;
        `, [currentUserId]);

    res.render('pages/chat', {
      title: 'Chat',
      connections: connections,
      currentUserId: currentUserId, // Pass this to the template!
      userId: currentUserId // For navbar
    });

  } catch (error) {
    console.error('Error fetching chat page:', error);
    res.render('pages/home', {
      title: 'Error',
      error: 'Could not load chat.',
      userId: req.session.userId // Pass session data
    });
  }
});

// API route to get message history between two users
app.get('/chat/history/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const otherUserId = parseInt(req.params.otherUserId, 10);

    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user ID.' });
    }

    const history = await db.any(`
            SELECT * FROM messages
            WHERE 
                (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC;
        `, [currentUserId, otherUserId]);

    res.json(history); // Send the history back as JSON

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Could not fetch history.' });
  }
});


// *****************************************************
// // *****************************************************

// Allow socket.io to access Express sessions
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  const currentUserId = socket.request.session.userId;

  if (!currentUserId) {
    console.log(`Socket ${socket.id} disconnected (no session).`);
    return socket.disconnect(true);
  }

  socket.join(currentUserId.toString());

  socket.on('joinRoom', ({ otherUserId }) => {
    const roomName = [currentUserId, otherUserId].sort().join('-');
    socket.join(roomName);
    console.log(`User ${currentUserId} (socket ${socket.id}) joined room: ${roomName}`);
  });

  socket.on('sendMessage', async ({ message, toUserId }) => {
    try {
      await db.none(`
                INSERT INTO messages (sender_id, receiver_id, message_text)
                VALUES ($1, $2, $3)
            `, [currentUserId, toUserId, message]);

      const roomName = [currentUserId, toUserId].sort().join('-');

      io.to(roomName).emit('receiveMessage', {
        message: message,
        fromUserId: currentUserId
      });

    } catch (error) {
      console.error('Error saving or sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id} (User: ${currentUserId})`);
  });
});
// *****************************************************
// <!-- Section 6: Start Server -->
// *****************************************************

const PORT = process.env.PORT || 3000;

// Start the server only if this file is run directly (not required by a test)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// Export the server for testing
module.exports = server;