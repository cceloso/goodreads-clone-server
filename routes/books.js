var express = require('express');
var router = express.Router();
const passport = require('passport');
const multer = require('multer');
const path = require('path');

const booksController = require('../controllers/books.controller');
const commentsController = require('../controllers/comments.controller');
const reviewsController = require('../controllers/reviews.controller');

/* -- STORAGE FOR BOOK COVERS -- */

const bookCoverPath = path.join(__dirname, '..', '..', 'public', 'images', 'books');
const bookCoverStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, bookCoverPath);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
        } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

/* -- BOOKS -- */

router.get('/:bookId', booksController.getBook);
router.get('/', booksController.getBooks);
// router.post('/', passport.authenticate('jwt', { session: false }), booksController.postBook);
// router.post('/', upload.single('imageUrl'), booksController.postBook);
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
