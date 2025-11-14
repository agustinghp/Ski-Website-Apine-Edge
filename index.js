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




// *****************************************************
// // *****************************************************



// Load User Routes
const userRoutes = require('./routes/userRoutes')(db, auth);
const authRoutes = require('./routes/authRoutes')(db);
const homeRoutes = require('./routes/homeRoutes')();
const profileRoutes = require('./routes/profileRoutes')(db, auth);
const searchRoutes = require('./routes/searchRoutes')(db);
const listingRoutes = require('./routes/listingRoutes')(db, auth);
const productRoutes = require('./routes/productRoutes')(db);
const serviceRoutes = require('./routes/serviceRoutes')(db);
const chatRoutes = require('./routes/chatRoutes')(db, auth);

app.use('/users', userRoutes);
app.use('/', authRoutes);
app.use('/', homeRoutes);
app.use('/profile', profileRoutes);
app.use('/search', searchRoutes);
app.use('/create-listing', listingRoutes);
app.use('/products', productRoutes);
app.use('/services', serviceRoutes);
app.use('/chat', chatRoutes);



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
// ****************************************************

const PORT = process.env.PORT || 3000;

// Start the server only if this file is run directly (not required by a test)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// Export the server for testing
module.exports = server;