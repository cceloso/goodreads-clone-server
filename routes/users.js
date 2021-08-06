var express = require('express');
var router = express.Router();

const reviewsController = require('../controllers/reviews.controller');
const usersController = require('../controllers/users.controller');

router.get('/:userId', usersController.getUser);
router.get('/:userId/reviews', reviewsController.getReviewsByUser);
router.post('/', usersController.postUser);
router.post('/login', usersController.loginUser);
router.put('/:userId', usersController.putUser);
router.delete('/:userId', usersController.deleteUser);

module.exports = router;
