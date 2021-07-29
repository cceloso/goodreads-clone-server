const responsesController = require('./responses.controller');
const booksRepo = require('../repositories/books.repository');
const genresRepo = require('../repositories/genres.repository');
const { nanoid } = require('nanoid');

let bookIndex = 1;

const controller = {
    getBook: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.bookId) {
                const splittedUrl = req.url.split('?');

                if(splittedUrl.length == 1) {
                    booksRepo.getAllBooks()
                    .then((val) => {
                        let books = val[0][0];
                        resolve(books);
                    })
                    .catch((err) => {
                        errorCode = 500;
                        reject(responsesController.createErrorMessage(500, err, "ERROR"));
                    })
                } else {
                    const splittedParams = splittedUrl[1].split('=');
                    const genreName = splittedParams[1];

                    console.log("genreName");
                    console.log(genreName);

                    if(genreName == "all") {
                        genresRepo.getAllGenres()
                        .then((val) => {
                            let genres = val[0][0];
                            resolve(genres);
                        })
                        .catch((err) => {
                            errorCode = 500;
                            reject(responsesController.createErrorMessage(500, "Server-side error.", "ERROR"));
                        })
                    } else {
                        booksRepo.getBooksByGenre(genreName)
                        .then((val) => {
                            let books = val[0][0];
                            if(books.length != 0) {
                                // console.log(books);
                                resolve(books);
                            } else {
                                // console.log("No books with that genre");
                                errorCode = 404;
                                reject(responsesController.createErrorMessage(404, "Genre not found or no books associated with that genre.", "NOT_FOUND"));
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            errorCode = 500;
                            reject(responsesController.createErrorMessage(500, "Server-side error.", "UNKNOWN"));
                        })
                    }
                }
            }

            else {
                booksRepo.getBook(req.params.bookId)
                .then((val) => {
                    let book = val[0][0];
                    if(book.length == 0) {
                        errorCode = 404;
                        reject(responsesController.createErrorMessage(404, "Book not found. Please provide a valid book id.", "NOT_FOUND"));
                    } else {
                        resolve(book);
                    }
                })
                .catch((err) => {
                    // console.log("inside catch");
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                })
            }
        })
        .then((booksToDisplay) => {
            res.status(200).json(booksToDisplay);
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    postBook: (req, res) => {
        new Promise((resolve, reject) => {
            // let bookId = nanoid();
            let bookId = bookIndex;
            let genreId = "";
            let genreName = "";
            let genres = [];
            // let genreId = nanoid();
            const expectedAttributes = 8;

            if(req.params.bookId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Book id parameter is set. If you intend to edit the book with this id, please send a PUT request; else, please remove id parameter.", "INVALID_ARGUMENT"));
            }

            else if(!req.body.data) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
            }

            else {
                if(Object.keys(req.body.data).length < expectedAttributes) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
                } else if(Object.keys(req.body.data).length > expectedAttributes) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
                } else if(req.body.data.genres.length == 0) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Genres attribute is empty.", "INVALID_ARGUMENT"));
                } else {
                    const authorId = nanoid();
                    booksRepo.addBook(bookId, authorId, req.body.data)
                    .then(() => {
                        bookIndex++;
                        resolve();
                    })
                    .then(() => {
                        genres = req.body.data.genres;

                        // Check if each genre exists; if not, add it
                        for(let i = 0; i < genres.length; i++) {
                            genreId = nanoid();
                            genreName = genres[i];
                            booksRepo.postBookGenre(bookId, genreId, genreName)
                            .then((val) => {
                                let result = val[0][1];
                                let affectedRows = result.affectedRows;
                                if(affectedRows == 0) {
                                    errorCode = 400;
                                    reject(responsesController.createErrorMessage(400, "Genre is already associated with the book.", "BAD_REQUEST"));
                                } else {
                                    resolve();
                                }
                            })
                            .catch((err) => {
                                console.log("inside catch");
                                errorCode = 500;
                                reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                            })
                        }
                        resolve();
                    })
                    .catch((err) => {
                        if(err.code == 'ER_DUP_ENTRY') {
                            let dupEntryMessage = err.sqlMessage.split(' ');
                            let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                            errorCode = 409;

                            if(dupEntryKey == `'titleAndAuthor'`) {
                                reject(responsesController.createErrorMessage(409, "Book with that title and author already exists.", "ALREADY_EXISTS"));
                            } else if(dupEntryKey == `'PRIMARY'`) {
                                reject(responsesController.createErrorMessage(409, "Book with that id already exists.", "ALREADY_EXISTS"));
                            }
                        }

                        else {
                            errorCode = 500;
                            reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                        }
                    })
                }
            }
        })
        .then(() => {
            res.status(201).json({
                message: "Successfully added a book."
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    putBook: (req, res) => {
        new Promise((resolve, reject) => {
            let bookId = "";
            let genreId = "";
            let genreName = "";
            let newGenres = [];
            let oldGenres = [];
            let genresToAdd = [];
            let genresToDelete = [];
            const expectedAttributes = 8;

            if(!req.params.bookId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Book id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            else if(!req.body.data) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
            }

            else {
                newGenres = req.body.data.genres;

                if(Object.keys(req.body.data).length < expectedAttributes) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
                } else if(Object.keys(req.body.data).length > expectedAttributes) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
                } else if(newGenres.length == 0) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Genres attribute is empty.", "INVALID_ARGUMENT"));
                } else {
                    bookId = req.params.bookId;
                    const authorId = nanoid();

                    booksRepo.editBook(bookId, authorId, req.body.data)
                        .then((val) => {
                            if(val[0][1].affectedRows == 0) {
                                errorCode = 404;
                                reject(responsesController.createErrorMessage(404, "Book not found. Please pass a valid book id.", "NOT_FOUND"));
                            } else {
                                resolve();
                            }
                        })
                        .then(() => {
                            

                            booksRepo.getBookGenre(req.params.bookId)
                            .then((val) => {
                                let result = val[0][0];
                                if(result.length == 0) {
                                    errorCode = 404;
                                    console.log("if error");
                                    // reject(responsesController.createErrorMessage(404, "Book not found. Please provide a valid book id.", "NOT_FOUND"));
                                } else {
                                    result[0].genres = result[0].genres.split(',');
                                    oldGenres = result[0].genres;

                                    console.log("oldGenres:");
                                    console.log(oldGenres);

                                    genresToAdd = newGenres.filter(x => oldGenres.indexOf(x) === -1);

                                    console.log("genresToAdd:");
                                    console.log(genresToAdd);

                                    genresToDelete = oldGenres.filter(x => newGenres.indexOf(x) === -1);
                                    
                                    console.log("genresToDelete:");
                                    console.log(genresToDelete);

                                    // resolve(genres);
                                    resolve();
                                }
                            })

                            .then(() => {
                                console.log("will add book genre");
                                // Add genres not yet associated with book
                                for(let i = 0; i < genresToAdd.length; i++) {
                                    genreId = nanoid();
                                    genreName = genresToAdd[i];
                                    booksRepo.postBookGenre(bookId, genreId, genreName)
                                    .then((val) => {
                                        let result = val[0][1];
                                        let affectedRows = result.affectedRows;
                                        if(affectedRows == 0) {
                                            errorCode = 400;
                                            reject(responsesController.createErrorMessage(400, "Genre is already associated with the book.", "BAD_REQUEST"));
                                        } else {
                                            resolve();
                                        }
                                    })
                                    .catch((err) => {
                                        console.log("inside catch");
                                        errorCode = 500;
                                        reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                                    })
                                }
                            })
                            
                            .then(() => {
                                console.log("will delete book genre");
                                // Delete genres not associated with book anymore
                                for(let i = 0; i < genresToDelete.length; i++) {
                                    genreId = nanoid();
                                    genreName = genresToDelete[i];
                                    booksRepo.deleteBookGenre(bookId, genreName)
                                    .then((val) => {
                                        resolve();
                                    })
                                    .catch((err) => {
                                        console.log("inside catch in delete genre catch");
                                        errorCode = 500;
                                        reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                                    })
                                }
                            })

                            .catch((err) => {
                                console.log("inside catch");
                                errorCode = 500;
                                reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                            })
                            
                            resolve();
                        })
                    
                        .catch((err) => {
                            if(err.code == 'ER_DUP_ENTRY') {
                                let dupEntryMessage = err.sqlMessage.split(' ');
                                let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                                errorCode = 409;

                                if(dupEntryKey == `'titleAndAuthor'`) {
                                    reject(responsesController.createErrorMessage(409, "Book with that title and author already exists.", "ALREADY_EXISTS"));
                                } else if(dupEntryKey == `'PRIMARY'`) {
                                    reject(responsesController.createErrorMessage(409, "Book with that id already exists.", "ALREADY_EXISTS"));
                                }
                            }

                            else {
                                errorCode = 500;
                                reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                            }
                        })
                }
            }
        })
        .then(() => {
            res.status(200).json({
                message: `Successfully edited book with id ${req.params.bookId}.`
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    deleteBook: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.bookId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Book id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            else {
                booksRepo.deleteBook(req.params.bookId)
                .then((val) => {
                    if(val[0].affectedRows == 0) {
                        errorCode = 404;
                        reject(responsesController.createErrorMessage(404, "Book not found. Please pass a valid book id.", "NOT_FOUND"));
                    } else {
                        resolve();
                    }
                })
                .catch((err) => {
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                })
            }
        })
        .then(() => {
            res.status(200).json({
                message: `Successfully deleted book with id ${req.params.bookId}.`,
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    getBookGenre: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.bookId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(404, "Book id parameter is empty.", "INVALID_ARGUMENT"));
            }

            else {
                booksRepo.getBookGenre(req.params.bookId)
                .then((val) => {
                    let result = val[0][0];
                    if(result.length == 0) {
                        errorCode = 404;
                        reject(responsesController.createErrorMessage(404, "Book not found. Please provide a valid book id.", "NOT_FOUND"));
                    } else {
                        result[0].genres = result[0].genres.split(',');
                        let genres = result[0];

                        console.log(genres);
                        resolve(genres);
                    }
                })
                .catch((err) => {
                    console.log("inside catch");
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                })
            }
        })
        .then((genresToDisplay) => {
            res.status(200).json({
                data: genresToDisplay
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    postBookGenre: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.bookId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(404, "Book id parameter is empty.", "INVALID_ARGUMENT"));
            }

            // Add genre to book
            else {
                booksRepo.postBookGenre(req.params.bookId, nanoid(), req.body.data.name)
                .then((val) => {
                    let result = val[0][1];
                    let affectedRows = result.affectedRows;
                    if(affectedRows == 0) {
                        errorCode = 400;
                        reject(responsesController.createErrorMessage(400, "Genre is already associated with the book.", "BAD_REQUEST"));
                    } else {
                        resolve();
                    }
                })
                .catch((err) => {
                    console.log("inside catch");
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                })
            }
        })
        .then(() => {
            res.status(200).json({
                message: `Successfully added genre ${req.body.data.name} to book.`,
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    deleteBookAndGenre: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.bookId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(404, "Book id parameter is empty.", "INVALID_ARGUMENT"));
            } else if(!req.params.genreId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(404, "Genre id parameter is empty.", "INVALID_ARGUMENT"));
            }

            // Delete book and genre relation
            else {
                booksRepo.deleteBookAndGenre(req.params.bookId, req.params.genreId)
                .then((val) => {
                    if(val[0].affectedRows == 0) {
                        errorCode = 404;
                        reject(responsesController.createErrorMessage(404, "Genre not found, or genre not associated with the book.", "NOT_FOUND"));
                    } else {
                        resolve();
                    }
                })
                .catch((err) => {
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                })
            }
        })
        .then(() => {
            res.status(200).json({
                message: `Successfully deleted genre with ${req.params.genreId}.`,
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    }
};

module.exports = controller;