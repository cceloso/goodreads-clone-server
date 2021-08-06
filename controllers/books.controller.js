const responsesController = require('./responses.controller');

const booksRepo = require('../repositories/books.repository');
const reviewsRepo = require('../repositories/reviews.repository');
const commentsRepo = require('../repositories/comments.repository');

const url = require('url');

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
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        })
    },

    getBooks: (req, res) => {
        const queryObject = url.parse(req.url, true).query;
        const genre = queryObject.genre;

        if(genre == "all" || genre == undefined) {
            booksRepo.getBooks()
            .then((val) => {
                let books = val[0][0];
                responsesController.sendData(res, 200, books);
            })
        } else {
            booksRepo.getBooksByGenre(genre)
            .then((val) => {
                let books = val[0][0];
                if(books.length != 0) {
                    responsesController.sendData(res, 200, books);
                } else {
                    responsesController.sendError(res, 404, "Genre not found or no books associated with that genre.", "NOT_FOUND");
                }
            })
        }
    },

    postBook: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        booksRepo.addBook(req.body)
        .then(() => {
            responsesController.sendData(res, 201, {message: "Successfully added a book."});
        })
        .catch((err) => {
            if(err.code == 'ER_DUP_ENTRY') {
                let dupEntryMessage = err.sqlMessage.split(' ');
                let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                errorCode = 409;

                if(dupEntryKey == `'titleAndAuthor'`) {
                    responsesController.sendError(res, 409, "Book with that title and author already exists.", "DUPLICATE_ENTRY");
                }
            }

            else {
                responsesController.sendError(res, 400, err, "BAD_REQUEST");
            }
        })
    },
    
    putBook: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        booksRepo.editBook(req.params.bookId, req.body)
        .then(() => {
            responsesController.sendData(res, 201, {message: "Successfully edited book."});
        })
        .catch((err) => {
            responsesController.sendError(res, 404, err, "BAD_REQUEST");
        })
    },

    deleteBook: (req, res) => {
        const bookId = req.params.bookId;

        commentsRepo.deleteCommentsByBook(bookId)
        .then(() => reviewsRepo.deleteReviewsByBook(bookId))
        .then(() => booksRepo.deleteBook(bookId))
        .then(() => {
            responsesController.sendData(res, 200, {message: "Successfully deleted book."});
        })
        .catch((err) => {
            responsesController.sendError(res, 404, err, "BAD_REQUEST");
        })
    }
};

module.exports = controller;