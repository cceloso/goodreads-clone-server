var express = require('express');
var router = express.Router();

const booksController = require('../controllers/books.controller');
const commentsController = require('../controllers/comments.controller');
const reviewsController = require('../controllers/reviews.controller');

/* -- BOOKS -- */

/* Add book */
router.post('/', booksController.postBook);

/* Add book (w/ bookId, invalid) */
router.post('/:bookId', booksController.postBook);

/* Edit book (w/o bookId, invalid) */
router.put('/', booksController.putBook);

/* Edit book */
router.put('/:bookId', booksController.putBook);

/* View all books */
router.get('/', booksController.getBooks);

/* View specific book */
router.get('/:bookId', booksController.getBook);

/* Delete specific book (w/o bookId, invalid) */
router.delete('/', booksController.deleteBook);

/* Delete specific book */
router.delete('/:bookId', booksController.deleteBook);

/* View books by genre */
router.get('/?genre=:genreId', booksController.getBooks);


/* -- REVIEWS -- */

router.get('/:bookId/reviews/:reviewId', reviewsController.getReview);
router.get('/:bookId/reviews', reviewsController.getReviews);
router.post('/:bookId/reviews', reviewsController.postReview);

/* Edit review */
router.put('/:bookId/reviews/:reviewId', reviewsController.putReview);

/* Edit review (w/o reviewId, invalid) */
router.put('/:bookId/reviews', reviewsController.putReview);

/* Delete review */
router.delete('/:bookId/reviews/:reviewId', reviewsController.deleteReview);

/* Delete review (w/o reviewId, invalid) */
router.delete('/:bookId/reviews/', reviewsController.deleteReview);


/* -- COMMENTS -- */

router.get('/:bookId/reviews/:reviewId/comments/:commentId', commentsController.getComment);
router.get('/:bookId/reviews/:reviewId/comments', commentsController.getComments);

/* Add comment */
// router.post('/:bookId/reviews/:reviewId/comments/?userId=:userId', commentsController.postComment);
router.post('/:bookId/reviews/:reviewId/comments', commentsController.postComment);

/* Edit comment */
router.put('/:bookId/reviews/:reviewId/comments/:commentId', commentsController.putComment);

/* Edit comment (w/o commentId, invalid) */
router.put('/:bookId/reviews/:reviewId/comments/:commentId', commentsController.putComment);

/* Delete comment */
router.delete('/:bookId/reviews/:reviewId/comments/:commentId', commentsController.deleteComment);

/* Delete comment (w/o commentId, invalid) */
router.delete('/:bookId/reviews/:reviewId/comments', commentsController.deleteComment);

module.exports = router;
