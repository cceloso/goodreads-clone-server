const responsesController = require('./responses.controller');
const commentsRepo = require('../repositories/comments.repository');
const usersRepo = require('../repositories/users.repository');

const controller = {
    getComment: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.commentId) {
                console.log("from getAllComments: ");
                commentsRepo.getAllComments(req.params.reviewId)
                .then((val) => {
                    let comments = val[0][0];
                    resolve(comments);
                })
                .catch((err) => {
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "ERROR"));
                })
            }

            else {
                console.log("from getComment: ");
                commentsRepo.getComment(req.params.commentId)
                    .then((val) => {
                        let comment = val[0][0];
                        if(comment.length == 0) {
                            errorCode = 404;
                            reject(responsesController.createErrorMessage(404, "Comment not found. Please provide a valid comment id.", "NOT_FOUND"));
                        } else {
                            resolve(comment);
                        }
                    })
                    .catch((err) => {
                        errorCode = 500;
                        reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                    })
            }
        })
        .then((commentsToDisplay) => {
            res.status(200).json(commentsToDisplay);
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    postComment: (req, res) => {
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        const query = req.url.split('?')[1];
        const urlParams = new URLSearchParams(query);
        const userId = urlParams.get("userId");
        let userName = "";
        // console.log(`bookId: ${bookId}`);
        // console.log(`reviewId: ${reviewId}`);
        // console.log(`userId: ${userId}`);

        usersRepo.getUserById(userId)  
        .then((val) => {
            userName = val[0][0][0]['userName'];
            // console.log("userName:", userName);
        })
        .then(() => commentsRepo.addComment(req.body, bookId, reviewId, userId, userName))
        .then(() => {
            res.status(201).json({
                message: "Successfully added a comment."
            });
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "UNKNOWN"));
        })
    },

    putComment: (req, res) => {
        const commentId = req.params.commentId;
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        const query = req.url.split('?')[1];
        const urlParams = new URLSearchParams(query);
        const userId = urlParams.get("userId");
        console.log(`bookId: ${bookId}`);
        console.log(`reviewId: ${reviewId}`);
        console.log(`commentId: ${commentId}`);
        console.log(`userId: ${userId}`);

        commentsRepo.editComment(commentId, req.body)
        // .then((val) => {
        //     console.log("val:", val[0].affectedRows);
        //     // res.status(200).json("test");
        //     if(val[0].affectedRows === 0) {
        //         errorCode = 404;
        //         res.status(errorCode).json(responsesController.createErrorMessage(errorCode, "Comment not found. Please pass a valid comment id.", "NOT_FOUND"));
        //     } else {
        //         res.status(200).json({
        //             message: `Successfully edited comment.`
        //         });
        //     }
        // })
        .then(() => {
            res.status(200).json({
                message: `Successfully edited comment.`
            });
        })
        .catch((err) => {
            errorCode = 400;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "UNKNOWN"));
        })

        // new Promise((resolve, reject) => {
        //     const expectedAttributes = 1;

        //     if(!req.params.commentId) {
        //         errorCode = 400;
        //         reject(responsesController.createErrorMessage(400, "Comment id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
        //     }

        //     else if(!req.body.data) {
        //         errorCode = 400;
        //         reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
        //     }

        //     else {
        //         if(Object.keys(req.body.data).length < expectedAttributes) {
        //             errorCode = 400;
        //             reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
        //         } else if(Object.keys(req.body.data).length > expectedAttributes) {
        //             errorCode = 400;
        //             reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
        //         } else {
                    
        //         }
        //     }
        // })
        // .then(() => {
        //     res.status(200).json({
        //         message: `Successfully edited comment.`
        //     });
        // })
        // .catch((errorMessage) => {
        //     res.status(errorCode).json(errorMessage);
        // })
    },

    deleteComment: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.commentId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Comment id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            else {
                const commentId = req.params.commentId;
                const bookId = req.params.bookId;
                const reviewId = req.params.reviewId;
                const query = req.url.split('?')[1];
                const urlParams = new URLSearchParams(query);
                const userId = urlParams.get("userId");

                commentsRepo.deleteComment(commentId, bookId, reviewId, userId)
                .then((val) => {
                    // console.log(val[0][1].affectedRows);
                    if(val[0][1].affectedRows == 0) {
                        errorCode = 404;
                        reject(responsesController.createErrorMessage(404, "Comment not found. Please pass a valid comment id.", "NOT_FOUND"));
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
                message: `Successfully deleted comment.`,
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    }
};

module.exports = controller;