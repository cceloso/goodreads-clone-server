var express = require('express');
var router = express.Router();
const genresController = require('../controllers/genres.controller');

router.get('/', genresController.getGenres);

module.exports = router;
