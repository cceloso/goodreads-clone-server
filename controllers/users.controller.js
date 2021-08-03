const responsesController = require('./responses.controller');
const usersRepo = require('../repositories/users.repository');
const bcrypt = require('bcrypt');

let userIndex = 1;

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
                usersRepo.getUser(req.params.userId)
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
        new Promise((resolve, reject) => {
            const expectedAttributes = 6;

            if(req.params.userId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "User id parameter is set. If you intend to edit the user with this id, please send a PUT request; else, please remove id parameter.", "INVALID_ARGUMENT"));
            }

            else if(!req.body) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
            }

            else {
                // if(Object.keys(req.body).length < expectedAttributes) {
                //     errorCode = 400;
                //     reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
                // } else if(Object.keys(req.body).length > expectedAttributes) {
                //     errorCode = 400;
                //     reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
                // } 

                if(Object.keys(req.body).length == 2) {
                    usersRepo.loginUser(req.body);
                    resolve("test2");
                    // .then((val) => {
                    //     console.log("inside loginUser controller");
                    //     console.log(val[0][0][0]['password']);
                    //     const loginResult = val[0][0][0]['v_loginResult'];

                    //     resolve("test");
                        // if(loginResult === "SUCCESS") {
                        //     resolve("Login successful.");
                        // } else if(loginResult === "INVALID_PASSWORD") {
                        //     errorCode = 403;
                        //     reject(responsesController.createErrorMessage(403, "Invalid password.", "PERMISSION_DENIED"));
                        // } else if(loginResult === "INVALID_USER") {
                        //     errorCode = 403;
                        //     reject(responsesController.createErrorMessage(403, "Invalid username or email address.", "PERMISSION_DENIED"));
                        // }
                    // })
                    // .catch((err) => {
                    //     errorCode = 500;
                    //     reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                    // })
                }
                else {
                    let userId = userIndex;
                    usersRepo.addUser(userId, req.body)
                        .then((val) => {
                            userIndex++;
                            console.log("val:", val[0][0]);
                            resolve("Signup successful.");
                        })
                        .catch((err) => {
                            if(err.code == 'ER_DUP_ENTRY') {
                                let dupEntryMessage = err.sqlMessage.split(' ');
                                let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                                errorCode = 409;

                                if(dupEntryKey == `'username'`) {
                                    reject(responsesController.createErrorMessage(409, "User with that username already exists.", "ALREADY_EXISTS"));
                                } else if(dupEntryKey == `'email'`) {
                                    reject(responsesController.createErrorMessage(409, "User with that email address already exists.", "ALREADY_EXISTS"));
                                } else if(dupEntryKey == `'PRIMARY'`) {
                                    reject(responsesController.createErrorMessage(409, "User with that id already exists.", "ALREADY_EXISTS"));
                                }
                            }

                            else {
                                console.log("err:", err);
                                errorCode = 500;
                                reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                            }
                        })
                }
            }
        })
        .then((successMessage) => {
            res.status(201).json({
                message: successMessage
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    putUser: (req, res) => {
        new Promise((resolve, reject) => {
            const expectedAttributes = 6;

            if(!req.params.userId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "User id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
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
                } else {
                    usersRepo.editUser(req.params.userId, req.body.data)
                        .then((val) => {
                            if(val[0].affectedRows == 0) {
                                errorCode = 404;
                                reject(responsesController.createErrorMessage(404, "User not found. Please pass a valid user id.", "NOT_FOUND"));
                            } else {
                                resolve();
                            }
                        })
                        .catch((err) => {
                            if(err.code == 'ER_DUP_ENTRY') {
                                let dupEntryMessage = err.sqlMessage.split(' ');
                                let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                                errorCode = 409;

                                if(dupEntryKey == `'username'`) {
                                    reject(responsesController.createErrorMessage(409, "User with that username already exists.", "ALREADY_EXISTS"));
                                } else if(dupEntryKey == `'email'`) {
                                    reject(responsesController.createErrorMessage(409, "User with that email address already exists.", "ALREADY_EXISTS"));
                                } else if(dupEntryKey == `'PRIMARY'`) {
                                    reject(responsesController.createErrorMessage(409, "User with that id already exists.", "ALREADY_EXISTS"));
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
                message: `Successfully edited user with id ${req.params.userId}.`
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    deleteUser: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.userId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "User id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            else {
                usersRepo.deleteUser(req.params.userId)
                    .then((val) => {
                        if(val[0].affectedRows == 0) {
                            errorCode = 404;
                            reject(responsesController.createErrorMessage(404, "User not found. Please pass a valid user id.", "NOT_FOUND"));
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
                message: `Successfully deleted user with id ${req.params.userId}.`,
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    getReviewsByUser: (req, res) => {
        new Promise((resolve, reject) => {
            usersRepo.getReviewsByUser(req.params.userId)
            .then((val) => {
                let reviews = val[0][0];
                resolve(reviews);
            })
            .catch((err) => {
                errorCode = 500;
                reject(responsesController.createErrorMessage(500, err, "ERROR"));
            })
        })
        .then((usersToDisplay) => {
            res.status(200).json(usersToDisplay);
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    }
};

module.exports = controller;