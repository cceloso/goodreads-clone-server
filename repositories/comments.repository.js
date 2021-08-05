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
        .finally(() => knex.destroy);
    },
    
    editComment: (commentId, updatedComment, bookId, reviewId, userId) => {
        return knex.raw("CALL putComment(?, ?, ?, ?, ?)", [commentId, updatedComment.comment, bookId, reviewId, userId])
        .finally(() => knex.destroy);
    },

    deleteComment: (commentId, bookId, reviewId, userId) => {
        return knex.raw("CALL deleteComment(?, ?, ?, ?)", [commentId, bookId, reviewId, userId])
        .finally(() => knex.destroy);
    },
};

module.exports = usersRepo;