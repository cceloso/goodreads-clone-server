const commonRepo = require('./common.repository');
const knex = require('./knex');
const { nanoid } = require('nanoid');

const usersRepo = {
    getAllReviews: (bookId) => {
        return knex.raw("CALL getAllReviews(?)", [bookId])
        .finally(() => knex.destroy);
    },

    getReview: (reviewId) => {
        return knex.raw("CALL getReview(?)", [reviewId])
        .finally(() => knex.destroy);
    },

    addReview: (reviewId, newReview, bookId, userId) => {
        return knex.raw("CALL postReview(?, ?, ?, ?, ?)", [reviewId, newReview.rating, newReview.review, bookId, userId])
        .finally(() => knex.destroy);
    },
    
    editReview: (reviewId, updatedReview, bookId) => {
        return knex.raw("CALL putReview(?, ?, ?, ?)", [reviewId, updatedReview.rating, updatedReview.review, bookId])
        .finally(() => knex.destroy);
    },

    deleteReview: (reviewId, bookId) => {
        return knex.raw("CALL deleteReview(?, ?)", [reviewId, bookId])
        .finally(() => knex.destroy);
    },
};

module.exports = usersRepo;