const responsesController = require('./responses.controller');
const reviewsController = require('./reviews.controller');

const commentsRepo = require('../repositories/comments.repository');
const usersRepo = require('../repositories/users.repository');

const bcrypt = require('bcrypt');
const passport = require('passport');
const issueJWT = require('../lib/utils');
const reviewsRepo = require('../repositories/reviews.repository');

const controller = {
    getUser: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.userId) {
                console.log("from getAllUsers: ");
                usersRepo.getAllUsers()
                    .then((val) => {
                        let users = val[0][0];
                        resolve(users);
                    })
                    .catch((err) => {
                        errorCode = 500;
                        reject(responsesController.createErrorMessage(500, "Server-side error.", "ERROR"));
                    })
            }

            else {
                console.log("from getUsers: ");
                usersRepo.getUserById(req.params.userId)
                .then((val) => {
                    let user = val[0][0];
                    if(user.length == 0) {
                        errorCode = 404;
                        reject(responsesController.createErrorMessage(404, "User not found. Please provide a valid user id.", "NOT_FOUND"));
                    } else {
                        resolve(user);
                    }
                })
                .catch((err) => {
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                })
            }
        })
        .then((usersToDisplay) => {
            res.status(200).json(usersToDisplay);
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    postUser: (req, res) => {
        usersRepo.addUser(req.body)
        .then((val) => {
            const userObject = val[0][0][0];
            const tokenObject = issueJWT(userObject);
            console.log("tokenObject:", tokenObject);

            res.status(201).json({
                success: true,
                user: userObject,
                token: tokenObject.token,
                expiresIn: tokenObject.expires
            })
        })
        .catch((err) => {
            if(err.code === "ER_DUP_ENTRY") {
                errorCode = 409;
                
                const dupEntryMessage = err.sqlMessage.split(' ');
                const dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                console.log("dup entry key:", dupEntryKey);
                
                if(dupEntryKey == "'userName'") {
                    res.status(errorCode).json(responsesController.createErrorMessage(errorCode, "Username already taken", "DUPLICATE_ENTRY"));
                } else if(dupEntryKey == "'email'") {
                    res.status(errorCode).json(responsesController.createErrorMessage(errorCode, "Email already taken", "DUPLICATE_ENTRY"));
                }
            } else {
                errorCode = 400;
                res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "BAD_REQUEST"));
            }
        })
    },

    putUser: (req, res) => {
        usersRepo.editUser(req.body)
        .then(() => {
            res.status(201).json({
                message: "Successfully edited user."
            })
        })
        .catch((err) => {
            errorCode = 400;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "BAD_REQUEST"));
        })
    },

    // putUser: (req, res) => {
    //     new Promise((resolve, reject) => {
    //         const expectedAttributes = 6;

    //         if(!req.params.userId) {
    //             errorCode = 400;
    //             reject(responsesController.createErrorMessage(400, "User id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
    //         }

    //         else if(!req.body.data) {
    //             errorCode = 400;
    //             reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
    //         }

    //         else {
    //             if(Object.keys(req.body.data).length < expectedAttributes) {
    //                 errorCode = 400;
    //                 reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
    //             } else if(Object.keys(req.body.data).length > expectedAttributes) {
    //                 errorCode = 400;
    //                 reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
    //             } else {
    //                 usersRepo.editUser(req.params.userId, req.body.data)
    //                     .then((val) => {
    //                         if(val[0].affectedRows == 0) {
    //                             errorCode = 404;
    //                             reject(responsesController.createErrorMessage(404, "User not found. Please pass a valid user id.", "NOT_FOUND"));
    //                         } else {
    //                             resolve();
    //                         }
    //                     })
    //                     .catch((err) => {
    //                         if(err.code == 'ER_DUP_ENTRY') {
    //                             let dupEntryMessage = err.sqlMessage.split(' ');
    //                             let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
    //                             errorCode = 409;

    //                             if(dupEntryKey == `'username'`) {
    //                                 reject(responsesController.createErrorMessage(409, "User with that username already exists.", "ALREADY_EXISTS"));
    //                             } else if(dupEntryKey == `'email'`) {
    //                                 reject(responsesController.createErrorMessage(409, "User with that email address already exists.", "ALREADY_EXISTS"));
    //                             } else if(dupEntryKey == `'PRIMARY'`) {
    //                                 reject(responsesController.createErrorMessage(409, "User with that id already exists.", "ALREADY_EXISTS"));
    //                             }
    //                         }

    //                         else {
    //                             errorCode = 500;
    //                             reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
    //                         }
    //                     })
    //             }
    //         }
    //     })
    //     .then(() => {
    //         res.status(200).json({
    //             message: `Successfully edited user with id ${req.params.userId}.`
    //         });
    //     })
    //     .catch((errorMessage) => {
    //         res.status(errorCode).json(errorMessage);
    //     })
    // },

    deleteUser: (req, res) => {
        const userId = req.params.userId;
        let reviewsByUser = [];

        commentsRepo.deleteCommentsByUser(userId)
        .then(() => reviewsRepo.getReviewsByUser(userId))
        .then((val) => reviewsByUser = val[0][0])
        .then(() => reviewsController.deleteReviewsByUser(reviewsByUser))
        .then(() => usersRepo.deleteUser(userId))
        .then(() => {
            res.status(200).json({
                message: "Successfully deleted user."
            });
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(500, err, "UNKNOWN"));
        })
    },

    loginUser: (req, res) => {
        usersRepo.loginUser(req.body)
        .then((userObject) => {
            const tokenObject = issueJWT(userObject);
            // console.log("tokenObject:", tokenObject);
            // console.log("userObject:", userObject);

            res.status(200).json({
                success: true,
                token: tokenObject.token,
                expiresIn: tokenObject.expires
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(400).json({
                error: err
            });
        });
    }
};

module.exports = controller;