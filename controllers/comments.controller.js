const responsesController = require('./responses.controller');
const commentsRepo = require('../repositories/comments.repository');
const usersRepo = require('../repositories/users.repository');
const url = require('url');

const controller = {
    getComment: (req, res) => {
        commentsRepo.getComment(req.params.commentId)
        .then((val) => {
            let comment = val[0][0];
            if(comment.length == 0) {
                throw "Comment not found. Please provide a valid comment id.", "NOT_FOUND";
            } else {
                res.status(200).json(comment);
            }
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "UNKNOWN"));
        });
    },

    getComments: (req, res) => {
        commentsRepo.getComments(req.params.reviewId)
        .then((val) => {
            let comments = val[0][0];
            res.status(200).json(comments);
        })
        .catch((err) => {
            console.log("here");
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(500, err, "ERROR"));
        });
    },

    postComment: (req, res) => {
        console.log("inside postComment in controller");
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        const queryObject = url.parse(req.url, true).query;
        const userId = queryObject.userId;
        let userName = "";
        console.log(`bookId: ${bookId}`);
        console.log(`reviewId: ${reviewId}`);
        console.log(`userId: ${userId}`);

        usersRepo.getUserById(userId)  
        .then((val) => userName = val[0][0][0]['userName'])
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
    },

    deleteComment: (req, res) => {
        const commentId = req.params.commentId;
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        const query = req.url.split('?')[1];
        const urlParams = new URLSearchParams(query);
        const userId = urlParams.get("userId");

        commentsRepo.deleteComment(commentId)
        .then(() => {
            res.status(200).json({
                message: `Successfully deleted comment.`,
            });
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "UNKNOWN"));
        })
    }
};

module.exports = controller;