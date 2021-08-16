var express = require('express');
var router = express.Router();

module.exports = (socket) => {
    const genresController = require('../controllers/genres.controller')(socket);

    router.get('/', genresController.getGenres);

    return router;
}
