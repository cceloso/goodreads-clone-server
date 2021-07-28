var express = require('express');
var router = express.Router();
const controller = require('../controllers/main.controller');

/* -- BOOKS -- */

/* Add book */
router.post('/', controller.postBook);

/* Add book (w/ bookId, invalid) */
router.post('/:bookId', controller.postBook);

/* Edit book (w/o bookId, invalid) */
router.put('/', controller.putBook);

/* Edit book */
router.put('/:bookId', controller.putBook);

/* View all books */
router.get('/', controller.getBook);

/* View specific book */
router.get('/:bookId', controller.getBook);

/* Delete specific book (w/o bookId, invalid) */
router.delete('/', controller.deleteBook);

/* Delete specific book */
router.delete('/:bookId', controller.deleteBook);

/* View books by genre */
router.get('/?genre=:genreId', controller.getBook);


/* -- GENRES -- */

/* View genres of a book */
router.get('/:bookId/genres', controller.getBookGenre);

/* Add genre to a book */
router.post('/:bookId/genres', controller.postBookGenre);

/* Delete genre of a book */
router.delete('/:bookId/genres/:genreId', controller.deleteBookAndGenre);


/* -- REVIEWS -- */

/* View reviews of book */
router.get('/:bookId/reviews', controller.getReview);

/* View specific review of book */
router.get('/:bookId/reviews/:reviewId', controller.getReview);

/* Add review */
router.post('/:bookId/reviews', controller.postReview);

/* Edit review */
router.put('/:bookId/reviews/:reviewId', controller.putReview);

/* Edit review (w/o reviewId, invalid) */
router.put('/:bookId/reviews', controller.putReview);

/* Delete review */
router.delete('/:bookId/reviews/:reviewId', controller.deleteReview);

/* Delete review (w/o reviewId, invalid) */
router.delete('/:bookId/reviews/', controller.deleteReview);


/* -- COMMENTS -- */

/* View comments of review */
router.get('/:bookId/reviews/:reviewId/comments', controller.getComment);

/* View specific comment of review */
router.get('/:bookId/reviews/:reviewId/comments/:commentId', controller.getComment);

/* Add comment */
// router.post('/:bookId/reviews/:reviewId/comments?userId=:userId', controller.postComment);
router.post('/:bookId/reviews/:reviewId/comments', controller.postComment);

/* Edit comment */
router.put('/:bookId/reviews/:reviewId/comments/:commentId', controller.putComment);

/* Edit comment (w/o commentId, invalid) */
router.put('/:bookId/reviews/:reviewId/comments/:commentId', controller.putComment);

/* Delete comment */
router.delete('/:bookId/reviews/:reviewId/comments/:commentId', controller.deleteComment);

/* Delete comment (w/o commentId, invalid) */
router.delete('/:bookId/reviews/:reviewId/comments', controller.deleteComment);

module.exports = router;
