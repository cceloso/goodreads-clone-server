const knex = require('./knex');
const redis = require('./redis');

const usersRepo = {
    getComment: (commentId) => {
        return knex.raw("CALL getComment(?)", [commentId])
        .finally(() => knex.destroy);
    },
    
    getComments: (reviewId) => {
        return knex.raw("CALL getComments(?)", [reviewId])
        .finally(() => knex.destroy);
    },

    addComment: (newComment, bookId, reviewId, userId, userName) => {
        return knex.raw("CALL postComment(?, ?, ?, ?, ?)", [newComment.comment, bookId, reviewId, userId, userName])
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
        return knex.raw("CALL putComment(?, ?)", [commentId, updatedComment.comment])
        .then((val) => {
            if(val[0].affectedRows === 0) {
                throw "Comment not found. Please pass a valid comment id.";
            } else {
                redis.hset(`comments:${commentId}`, "comment", updatedComment.comment);
            }
        })
    },

    deleteComment: (commentId) => {
        return knex.raw("CALL deleteComment(?)", [commentId])
        .then((val) => {
            if(val[0].affectedRows === 0) {
                throw "Comment not found. Please pass a valid comment id.", "NOT_FOUND";
            } else {
                redis.del(`comments:${commentId}`);
            }
        })
    },

    deleteCommentsByBook: (bookId) => {
        return knex.raw("CALL deleteCommentsByBook(?)", [bookId]);
    },

    deleteCommentsByReview: (reviewId) => {
        return knex.raw("CALL deleteCommentsByReview(?)", [reviewId]);
    },

    deleteCommentsByUser: (userId) => {
        return knex.raw("CALL deleteCommentsByUser(?)", [userId]);
    }
};

module.exports = usersRepo;