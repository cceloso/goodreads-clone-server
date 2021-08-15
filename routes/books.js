var express = require('express');
var router = express.Router();
const passport = require('passport');

const booksController = require('../controllers/books.controller');
const commentsController = require('../controllers/comments.controller');
const reviewsController = require('../controllers/reviews.controller');

/* -- BOOKS -- */

router.get('/:bookId', booksController.getBook);
router.get('/', booksController.getBooks);
// router.post('/', passport.authenticate('jwt', { session: false }), booksController.postBook);
router.post('/', booksController.postBook);
router.put('/:bookId', passport.authenticate('jwt', { session: false }), booksController.putBook);
router.delete('/:bookId', passport.authenticate('jwt', { session: false }), booksController.deleteBook);
router.get('/?genre=:genreId', booksController.getBooks);
router.get('/?search=:searchParam', booksController.getBooks);

/* -- REVIEWS -- */

router.get('/:bookId/reviews/:reviewId', reviewsController.getReview);
router.get('/:bookId/reviews?userId=:userId', reviewsController.getReview);
router.get('/:bookId/reviews', reviewsController.getReviews);
router.post('/:bookId/reviews', passport.authenticate('jwt', { session: false }), reviewsController.postReview);
router.put('/:bookId/reviews/:reviewId', passport.authenticate('jwt', { session: false }), reviewsController.putReview);
router.delete('/:bookId/reviews/:reviewId', passport.authenticate('jwt', { session: false }), reviewsController.deleteReview);

/* -- COMMENTS -- */

router.get('/:bookId/reviews/:reviewId/comments/:commentId', commentsController.getComment);
router.get('/:bookId/reviews/:reviewId/comments', commentsController.getComments);
router.post('/:bookId/reviews/:reviewId/comments', passport.authenticate('jwt', { session: false }), commentsController.postComment);
router.put('/:bookId/reviews/:reviewId/comments/:commentId', passport.authenticate('jwt', { session: false }), commentsController.putComment);
router.delete('/:bookId/reviews/:reviewId/comments/:commentId', passport.authenticate('jwt', { session: false }), commentsController.deleteComment);

module.exports = router;
