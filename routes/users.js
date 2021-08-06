var express = require('express');
var router = express.Router();

const reviewsController = require('../controllers/reviews.controller');
const usersController = require('../controllers/users.controller');

router.get('/:userId', usersController.getUser);
router.get('/:userId/reviews', reviewsController.getReviewsByUser);

/* Add user */
router.post('/', usersController.postUser);

/* Add user (w/ userId, invalid) */
router.post('/:userId', usersController.postUser);

/* Edit user (w/o userId, invalid) */
router.put('/', usersController.putUser);

/* Edit user */
router.put('/:userId', usersController.putUser);

/* Delete specific user (w/o bookId, invalid) */
router.delete('/', usersController.deleteUser);

/* Delete specific user */
router.delete('/:userId', usersController.deleteUser);

module.exports = router;
