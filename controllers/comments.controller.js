const url = require('url');

module.exports = (socket) => {
    const responsesController = require('./responses.controller');

    const commentsRepo = require('../repositories/comments.repository');
    const usersRepo = require('../repositories/users.repository');

    return {
        getComment: (req, res) => {
            commentsRepo.getComment(req.params.commentId)
            .then((val) => {
                let comment = val[0][0];
                if(comment.length == 0) {
                    responsesController.sendError(res, 404, "Comment not found.", "NOT_FOUND");
                } else {
                    responsesController.sendData(res, 200, comment);
                }
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
        },
    
        getComments: (req, res) => {
            commentsRepo.getComments(req.params.reviewId)
            .then((val) => responsesController.sendData(res, 200, val[0][0]))
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
        },
    
        postComment: (req, res) => {
            if(Object.keys(req.body).length === 0) {
                responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
            }
    
            const bookId = req.params.bookId;
            const reviewId = req.params.reviewId;
            const queryObject = url.parse(req.url, true).query;
            const userId = queryObject.userId;
            let userName = "";
    
            usersRepo.getUserById(userId)
            .then((val) => userName = val[0][0][0]['userName'])
            .then(() => commentsRepo.addComment(req.body, bookId, reviewId, userId, userName))
            .then((val) => {
                const commentObject = val[0][0][0];
                const room = `bookUpdate-${bookId}-${reviewId}`;

                socket.broadcast(room, "newComment", {reviewId: reviewId, commentObject: commentObject});
                
                responsesController.sendData(res, 201, commentObject);
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
        },
    
        putComment: (req, res) => {
            if(Object.keys(req.body).length === 0) {
                responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
            }
    
            const commentId = req.params.commentId;
            const bookId = req.params.bookId;
            const reviewId = req.params.reviewId;
            const query = req.url.split('?')[1];
            const urlParams = new URLSearchParams(query);
            const userId = urlParams.get("userId");
    
            commentsRepo.editComment(commentId, req.body)
            .then((val) => {
                const commentObject = val[0][0][0];
                const room = `bookUpdate-${bookId}-${reviewId}`;

                socket.broadcast(room, "updatedComment", {reviewId: reviewId, commentObject: commentObject});

                responsesController.sendData(res, 200, commentObject);
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
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
                const room = `bookUpdate-${bookId}-${reviewId}`;

                socket.broadcast(room, "removedComment", {reviewId: reviewId, commentId: commentId});

                responsesController.sendData(res, 200, {message: "Successfully deleted comment."});
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
        }
    }
}
