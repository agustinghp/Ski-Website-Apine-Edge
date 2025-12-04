const express = require('express');
const router = express.Router();

module.exports = () => {


  router.get('/', (req, res) => {
    // Get message from session if it exists
    const message = req.session.message;
    // Clear the message from session after retrieving it
    delete req.session.message;

    res.render('pages/home', {
      title: 'Welcome to Alpine Edge!',
      userId: req.session.userId, // Pass session data to navbar
      message: message // Pass message to template
    });
  });
  return router;
};
