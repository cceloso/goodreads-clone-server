const responsesController = require('./responses.controller');
const reviewsController = require('./reviews.controller');

const commentsRepo = require('../repositories/comments.repository');
const reviewsRepo = require('../repositories/reviews.repository');
const usersRepo = require('../repositories/users.repository');

const issueJWT = require('../auth/jwt');

const controller = {
    getUser: (req, res) => {
        usersRepo.getUser(req.params.userId)
        .then((val) => {
            if(Object.keys(val).length === 0) {
                responsesController.sendError(res, 404, "User not found.", "NOT_FOUND");
            } else {
                responsesController.sendData(res, 200, val);
            }
        })
        .catch((err) => {
            responsesController.sendError(res, 500, err, "SERVER_ERROR");
        });
    },

    postUser: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        usersRepo.addUser(req.body)
        .then((userObject) => {
            const tokenObject = issueJWT(userObject);
            console.log("tokenObject:", tokenObject);

            responsesController.sendData(res, 201, {
                success: true,
                user: userObject,
                token: tokenObject.token,
                expiresIn: tokenObject.expires
            });
        })
        .catch((err) => {
            if(err.code === "ER_DUP_ENTRY") {
                const dupEntryMessage = err.sqlMessage.split(' ');
                const dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                
                if(dupEntryKey == "'userName'") {
                    responsesController.sendError(res, 409, "Username already taken", "DUPLICATE_ENTRY");
                } else if(dupEntryKey == "'email'") {
                    responsesController.sendError(res, 409, "Email already taken", "DUPLICATE_ENTRY");
                }
            } else {
                responsesController.sendError(res, 400, err, "BAD_REQUEST");
            }
        })
    },

    putUser: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }
        
        usersRepo.editUser(req.body)
        .then(() => {
            responsesController.sendData(res, 201, {message: "Successfully edited user."});
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
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
            responsesController.sendData(res, 200, {message: "Successfully deleted user."});
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        })
    },

    loginUser: (req, res) => {
        usersRepo.loginUser(req.body)
        .then((userObject) => {
            const tokenObject = issueJWT(userObject);
            console.log("tokenObject:", tokenObject);

            responsesController.sendData(res, 200, {
                success: true,
                token: tokenObject.token,
                expiresIn: tokenObject.expires
            });
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        });
    }
};

module.exports = controller;