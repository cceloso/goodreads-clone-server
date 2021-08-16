var express = require('express');
var router = express.Router();

module.exports = (socket) => {
    const reviewsController = require('../controllers/reviews.controller')(socket);
    const usersController = require('../controllers/users.controller')(socket);

    router.get('/:userId', usersController.getUser);
    router.get('/:userId/reviews', reviewsController.getReviewsByUser);
    router.post('/', usersController.postUser);
    router.post('/login', usersController.loginUser);
    router.put('/:userId', usersController.putUser);
    router.delete('/:userId', usersController.deleteUser);

    return router;
}
