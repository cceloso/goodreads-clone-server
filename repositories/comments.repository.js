const knex = require('./knex');
const redis = require('./redis');

const usersRepo = {
    getAllComments: (reviewId) => {
        return knex.raw("CALL getAllComments(?)", [reviewId])
        .finally(() => knex.destroy);
    },

    getComment: (commentId) => {
        return knex.raw("CALL getComment(?)", [commentId])
        .finally(() => knex.destroy);
    },

    addComment: (newComment, bookId, reviewId, userId, userName) => {
        return knex.raw("CALL postComment_flat(?, ?, ?, ?, ?)", [newComment.comment, bookId, reviewId, userId, userName])
        .then((val) => {
            const commentObject = val[0][0][0];

            const redisObject = {
                id: commentObject.id,
                comment: commentObject.comment,
                dateCreated: commentObject.dateCreated,
                bookId: commentObject.bookId,
                reviewId: commentObject.reviewId,
                userId: commentObject.userId,
                userName: commentObject.userName
            };

            redis.hmset(`comments:${commentObject.id}`, redisObject);
        })
    },
    
    // editComment: (commentId, updatedComment, bookId, reviewId, userId) => {
    //     return knex.raw("CALL putComment(?, ?, ?, ?, ?)", [commentId, updatedComment.comment, bookId, reviewId, userId])
    //     .finally(() => knex.destroy);
    // },

    editComment: (commentId, updatedComment) => {
        return knex.raw("CALL putComment_flat(?, ?)", [commentId, updatedComment.comment])
        .then((val) => {
            redis.hset(`comments:${commentObject.id}`, "comment", updatedComment.comment);

            // console.log("affectedRows:", val[0].affectedRows);
            // if(val[0].affectedRows === 0) {
            //     errorCode = 404;
            //     // res.status(errorCode).json(responsesController.createErrorMessage(errorCode, "Comment not found. Please pass a valid comment id.", "NOT_FOUND"));
            //     throw "Comment not found. Please pass a valid comment id.";
            // } else {
            //     console.log("will update redis");
            //     console.log("commentId:", commentId);
            //     console.log("updatedComment:", updatedComment.comment);

            //     const redisObject = {
            //         comment: updatedComment.comment
            //     };

            //     redis.hmset(`comments:${commentObject.id}`, redisObject);   
            // }
        })
    },

    deleteComment: (commentId, bookId, reviewId, userId) => {
        return knex.raw("CALL deleteComment(?, ?, ?, ?)", [commentId, bookId, reviewId, userId])
        .finally(() => knex.destroy);
    },
};

module.exports = usersRepo;