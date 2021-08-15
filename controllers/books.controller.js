const responsesController = require('./responses.controller');

const booksRepo = require('../repositories/books.repository');
const commentsRepo = require('../repositories/comments.repository');
const genresRepo = require('../repositories/genres.repository');
const reviewsRepo = require('../repositories/reviews.repository');

const url = require('url');

const searchBooks = (res, searchParam) => {
    // Add percent symbols on both ends to check for substrings
    searchParam = `${searchParam}%`;

    booksRepo.searchBooksByTitleOrAuthor(searchParam)
    .then((val) => responsesController.sendData(res, 200, val[0][0]))
    .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
};

const getBooksByGenre = (res, genre) => {
    genresRepo.getGenre(genre)
    .then((val) => {
        if(val[0][0].length == 0) {
            responsesController.sendError(res, 404, "Genre not found.", "NOT_FOUND");
        }
    })
    .then(() => booksRepo.getBooksByGenre(genre))
    .then((val) => responsesController.sendData(res, 200, val[0][0]))
    .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
};

const controller = {
    getBook: (req, res) => {
        booksRepo.getBook(req.params.bookId)
        .then((val) => {
            if(Object.keys(val).length === 0) {
                responsesController.sendError(res, 404, "Book not found.", "NOT_FOUND");
            } else {
                responsesController.sendData(res, 200, val);
            }
        })
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
    },

    getBooks: (req, res) => {
        const queryObject = url.parse(req.url, true).query;
        const genre = queryObject.genre;
        const searchParam = queryObject.search;

        if(searchParam != undefined) {
            searchBooks(res, searchParam);
        } else if(genre == "all" || genre == undefined) {
            booksRepo.getBooks()
            .then((val) => responsesController.sendData(res, 200, val[0][0]))
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
        } else {
            getBooksByGenre(res, genre);
        }
    },

    postBook: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        const queryObject = url.parse(req.url, true).query;
        const userId = queryObject.userId;

        booksRepo.addBook(req.body, userId)
        .then(() => responsesController.sendData(res, 201, {message: "Successfully added a book."}))
        .catch((err) => {
            if(err.code == 'ER_DUP_ENTRY') {
                responsesController.sendError(res, 409, "Book with that title and author already exists.", "DUPLICATE_ENTRY");
            } else {
                responsesController.sendError(res, 400, err, "BAD_REQUEST");
            }
        })
    },
    
    putBook: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        booksRepo.editBook(req.params.bookId, req.body)
        .then(() => responsesController.sendData(res, 201, {message: "Successfully edited book."}))
        .catch((err) => responsesController.sendError(res, 404, err, "BAD_REQUEST"))
    },

    deleteBook: (req, res) => {
        const bookId = req.params.bookId;

        commentsRepo.deleteCommentsByBook(bookId)
        .then(() => reviewsRepo.deleteReviewsByBook(bookId))
        .then(() => booksRepo.deleteBook(bookId))
        .then(() => responsesController.sendData(res, 200, {message: "Successfully deleted book."}))
        .catch((err) => responsesController.sendError(res, 404, err, "BAD_REQUEST"))
    }
};

module.exports = controller;