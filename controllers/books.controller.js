const responsesController = require('./responses.controller');
const booksRepo = require('../repositories/books.repository');
const reviewsRepo = require('../repositories/reviews.repository');
const commentsRepo = require('../repositories/comments.repository');
const url = require('url');
// const { nanoid } = require('nanoid');

const controller = {
    getBook: (req, res) => {
        booksRepo.getBook(req.params.bookId)
        .then((val) => {
            if(Object.keys(val).length === 0) {
                errorCode = 404;
                throw "Book not found. Please provide a valid book id.";
            } else {
                // console.log("hgetall return value:", val);
                res.status(200).json(val);
            }
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "UNKNOWN"));
        })
    },

    getBooks: (req, res) => {
        const queryObject = url.parse(req.url, true).query;
        const genre = queryObject.genre;

        if(genre == "all") {
            booksRepo.getBooks()
            .then((val) => {
                let books = val[0][0];
                res.status(200).json(books);
            })
        } else {
            booksRepo.getBooksByGenre(genre)
            .then((val) => {
                let books = val[0][0];
                if(books.length != 0) {
                    console.log("specific, testing");
                    res.status(200).json(books);
                } else {
                    errorCode = 404;
                    res.status(errorCode).json(responsesController.createErrorMessage(errorCode, "Genre not found or no books associated with that genre.", "NOT_FOUND"));
                }
            })
        }
    },

    postBook: (req, res) => {
        booksRepo.addBook(req.body)
        .then(() => {
            res.status(201).json({
                message: "Successfully added a book."
            });
        })
        .catch((err) => {
            if(err.code == 'ER_DUP_ENTRY') {
                let dupEntryMessage = err.sqlMessage.split(' ');
                let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                errorCode = 409;

                if(dupEntryKey == `'titleAndAuthor'`) {
                    res.status(errorCode).json(responsesController.createErrorMessage(409, "Book with that title and author already exists.", "ALREADY_EXISTS"));
                } else if(dupEntryKey == `'PRIMARY'`) {
                    res.status(errorCode).json(responsesController.createErrorMessage(409, "Book with that id already exists.", "ALREADY_EXISTS"));
                }
            }

            else {
                console.log("postBook else in catch error:", err);
                errorCode = 500;
                res.status(errorCode).json(responsesController.createErrorMessage(500, err, "UNKNOWN"));
            }
        })
    },
    
    putBook: (req, res) => {
        booksRepo.editBook(req.params.bookId, req.body)
        .then(() => {
            res.status(201).json({
                message: "Successfully edited book."
            });
        })
        .catch((err) => {
            console.log("putBook else in catch error:", err);
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(500, err, "UNKNOWN"));
        })
    },

    deleteBook: (req, res) => {
        const bookId = req.params.bookId;

        commentsRepo.deleteCommentsByBook(bookId)
        .then(() => reviewsRepo.deleteReviewsByBook(bookId))
        .then(() => booksRepo.deleteBook(bookId))
        .then(() => {
            res.status(200).json({
                message: `Successfully deleted book with id ${bookId}.`,
            });
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "UNKNOWN"));
        })
    }
};

module.exports = controller;