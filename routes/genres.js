var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller');

/* Add genre */
router.post('/', controller.postGenre);

/* Add genre (w/ genreId, invalid) */
router.post('/:genreId', controller.postGenre);

/* Edit genre (w/o genreId, invalid) */
router.put('/', controller.putGenre);

/* Edit genre */
router.put('/:genreId', controller.putGenre);

/* View all genres */
router.get('/', controller.getGenre);

/* View specific genre */
router.get('/:genreId', controller.getGenre);

/* Delete specific genre (w/o genreId, invalid) */
router.delete('/', controller.deleteGenre);

/* Delete specific genre */
router.delete('/:genreId', controller.deleteGenre);

module.exports = router;
