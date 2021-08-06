const responsesController = require('./responses.controller');
const reviewsController = require('./reviews.controller');

const commentsRepo = require('../repositories/comments.repository');
const usersRepo = require('../repositories/users.repository');
const reviewsRepo = require('../repositories/reviews.repository');

const issueJWT = require('../lib/utils');

const controller = {
    getUser: (req, res) => {
        usersRepo.getUser(req.params.userId)
        .then((val) => {
            if(Object.keys(val).length === 0) {
                errorCode = 404;
                throw "User not found.";
            } else {
                res.status(200).json(val);
            }
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(500, err, "UNKNOWN"));
        });
    },

    postUser: (req, res) => {
        usersRepo.addUser(req.body)
        .then((userObject) => {
            // console.log("userObject in controller:", userObject);
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