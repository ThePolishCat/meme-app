const express = require('express');
const router = express.Router();
const Image = require('../models/image');
router.get('/', async (req, res) => {
    try {
      const images = await Image.find();
      res.render('partials/layout.ejs', { body: 'home', images });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  module.exports = router;