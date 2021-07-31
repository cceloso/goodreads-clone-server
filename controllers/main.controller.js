const booksController = require('./books.controller');
const usersController = require('./users.controller');
const genresController = require('./genres.controller');
const reviewsController = require('./reviews.controller');
const commentsController = require('./comments.controller');

const controller = {
    /* USERS CONTROLLER */
    getUser: usersController.getUser,
    postUser: usersController.postUser,
    putUser: usersController.putUser,
    deleteUser: usersController.deleteUser,
    getReviewsByUser: usersController.getReviewsByUser,

    /* BOOKS CONTROLLER */
    getBook: booksController.getBook,
    postBook: booksController.postBook,
    putBook: booksController.putBook,
    deleteBook: booksController.deleteBook,
    getBookGenre: booksController.getBookGenre,
    postBookGenre: booksController.postBookGenre,
    deleteBookAndGenre: booksController.deleteBookAndGenre,

    /* GENRES CONTROLLER */
    getGenre: genresController.getGenre,
    postGenre: genresController.postGenre,
    putGenre: genresController.putGenre,
    deleteGenre: genresController.deleteGenre,

    /* REVIEWS CONTROLLER */
    getReview: reviewsController.getReview,
    postReview: reviewsController.postReview,
    putReview: reviewsController.putReview,
    deleteReview: reviewsController.deleteReview,

    /* COMMENTS CONTROLLER */
    getComment: commentsController.getComment,
    postComment: commentsController.postComment,
    putComment: commentsController.putComment,
    deleteComment: commentsController.deleteComment,
};

module.exports = controller;