const express = require('express');
const router = express.Router();

module.exports = () => {


  router.get('/', (req, res) => {
    res.render('pages/home', {
      title: 'Welcome to Alpine Edge!',
      userId: req.session.userId // Pass session data to navbar
    });
  });
  return router;
};
