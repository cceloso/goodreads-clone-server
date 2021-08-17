const knex = require('./knex');
const redis = require('./redis');

const usersRepo = {
    getComment: (commentId) => {
        return knex.raw("CALL getComment(?)", [commentId]);
    },
    
    getComments: (reviewId) => {
        return knex.raw("CALL getComments(?)", [reviewId]);
    },

    addComment: (newComment, bookId, reviewId, userId, userName) => {
        return knex.raw("CALL postComment(?, ?, ?, ?, ?)", [newComment.comment, bookId, reviewId, userId, userName]);
    },

    editComment: (commentId, updatedComment) => {
        return knex.raw("CALL putComment(?, ?)", [commentId, updatedComment.comment]);
    },

    deleteComment: (commentId) => {
        return knex.raw("CALL deleteComment(?)", [commentId]);
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