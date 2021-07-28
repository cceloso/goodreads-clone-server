const responsesController = require('./responses.controller');
const genresRepo = require('../repositories/genres.repository');
const { nanoid } = require('nanoid');

const controller = {
    getGenre: (req, res) => {
        new Promise((resolve, reject) => {
            // View all genres
            if(!req.params.genreId) {
                genresRepo.getAllGenres()
                    .then((val) => {
                        let genres = val[0][0];
                        resolve(genres);
                    })
                    .catch((err) => {
                        errorCode = 500;
                        reject(responsesController.createErrorMessage(500, "Server-side error.", "ERROR"));
                    })
            }

            // View specific genre if there's genreId
            else {
                genresRepo.getGenre(req.params.genreId)
                    .then((val) => {
                        let genre = val[0][0];
                        if(genre.length == 0) {
                            errorCode = 404;
                            reject(responsesController.createErrorMessage(404, "Genre not found. Please provide a valid genre id.", "NOT_FOUND"));
                        } else {
                            resolve(genre);
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

    postGenre: (req, res) => {
        new Promise((resolve, reject) => {
            // Reject if genre id parameter is set (/genres/<genreId> instead of /genres)
            if(req.params.genreId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Genre id parameter is set. If you intend to edit the genre with this id, please send a PUT request; else, please remove id parameter.", "INVALID_ARGUMENT"));
            }

            // Reject if body is empty
            else if(!req.body.data) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
            }

            else {
                if(Object.keys(req.body.data).length < 1) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
                } else if(Object.keys(req.body.data).length > 1) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
                } else {
                    genresRepo.addGenre(nanoid(), req.body.data)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if(err.code == 'ER_DUP_ENTRY') {
                                let dupEntryMessage = err.sqlMessage.split(' ');
                                let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                                errorCode = 409;

                                if(dupEntryKey == `'name'`) {
                                    reject(responsesController.createErrorMessage(409, "Genre with that name already exists.", "ALREADY_EXISTS"));
                                } else if(dupEntryKey == `'PRIMARY'`) {
                                    reject(responsesController.createErrorMessage(409, "Genre with that id already exists.", "ALREADY_EXISTS"));
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
                message: "Successfully added a genre."
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    putGenre: (req, res) => {
        new Promise((resolve, reject) => {
            // Reject if body id parameter is empty (/genres instead of /genres/<genreId>)
            if(!req.params.genreId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Genre id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            // Reject if body is empty
            else if(!req.body.data) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
            }

            // Reject if genre doesn't exist; else, edit genre info
            else {
                if(Object.keys(req.body.data).length < 1) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
                } else if(Object.keys(req.body.data).length > 1) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
                } else {
                    genresRepo.editGenre(req.params.genreId, req.body.data)
                        .then((val) => {
                            if(val[0].affectedRows == 0) {
                                errorCode = 404;
                                reject(responsesController.createErrorMessage(404, "Genre not found. Please pass a valid genre id.", "NOT_FOUND"));
                            } else {
                                resolve();
                            }
                        })
                        .catch((err) => {
                            if(err.code == 'ER_DUP_ENTRY') {
                                let dupEntryMessage = err.sqlMessage.split(' ');
                                let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                                errorCode = 409;

                                if(dupEntryKey == `'name'`) {
                                    reject(responsesController.createErrorMessage(409, "Genre with that name already exists.", "ALREADY_EXISTS"));
                                } else if(dupEntryKey == `'PRIMARY'`) {
                                    reject(responsesController.createErrorMessage(409, "Genre with that id already exists.", "ALREADY_EXISTS"));
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
                message: `Successfully edited genre with id ${req.params.genreId}.`
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    deleteGenre: (req, res) => {
        new Promise((resolve, reject) => {
            // Reject if genre id parameter is empty (/genres instead of /genres/<genreId>)
            if(!req.params.genreId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Genre id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            else {
                genresRepo.deleteGenre(req.params.genreId)
                    .then((val) => {
                        if(val[0].affectedRows == 0) {
                            errorCode = 404;
                            reject(responsesController.createErrorMessage(404, "Genre not found. Please pass a valid genre id.", "NOT_FOUND"));
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
                message: `Successfully deleted genre with id ${req.params.genreId}.`,
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    }
};

module.exports = controller;