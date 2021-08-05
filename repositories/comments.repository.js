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

    editComment: (commentId, updatedComment) => {
        return knex.raw("CALL putComment_flat(?, ?)", [commentId, updatedComment.comment])
        .then((val) => {
            if(val[0].affectedRows === 0) {
                throw "Comment not found. Please pass a valid comment id.";
            } else {
                redis.hset(`comments:${commentId}`, "comment", updatedComment.comment);
            }
        })
    },

    deleteComment: (commentId) => {
        return knex.raw("CALL deleteComment_flat(?)", [commentId])
        .then((val) => {
            if(val[0].affectedRows === 0) {
                throw "Comment not found. Please pass a valid comment id.", "NOT_FOUND";
            } else {
                redis.del(`comments:${commentId}`);
            }
        })
    },

    deleteCommentsByBook: (bookId) => {
        return knex.raw("CALL deleteCommentsByBook_flat(?)", [bookId]);
    },

    deleteCommentsByReview: (reviewId) => {
        return knex.raw("CALL deleteCommentsByReview_flat(?)", [reviewId]);
    },
};

module.exports = usersRepo;