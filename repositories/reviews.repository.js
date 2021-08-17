const knex = require('./knex');
const redis = require('./redis');

const reviewsRepo = {
    getReview: (reviewId) => {
        return knex.raw("CALL getReview(?)", [reviewId]);
    },

    getReviewByUserAndBook: (userId, bookId) => {
        return knex.raw("CALL getReviewByUserAndBook(?, ?)", [userId, bookId]);
    },

    getReviews: (bookId) => {
        return knex.raw("CALL getReviews(?)", [bookId]);
    },

    getReviewsByUser: (userId) => {
        return knex.raw("CALL getReviewsByUser(?)", [userId]);
    },

    getReviewerById: (reviewId) => {
        return knex.raw("CALL getReviewerById(?)", [reviewId]);
    },

    addReview: (newReview, bookId, title, author, userId, userName) => {
        return knex.raw("CALL postReview(?, ?, ?, ?, ?, ?, ?)", [newReview.rating, newReview.review, bookId, title, author, userId, userName]);
    },

    editReview: (reviewId, updatedReview) => {
        return knex.raw("CALL putReview(?, ?, ?)", [reviewId, updatedReview.rating, updatedReview.review]);
    },

    deleteReview: (reviewId) => {
        return knex.raw("CALL deleteReview(?)", [reviewId]);
    },

    deleteReviewsByBook: (bookId) => {
        return knex.raw("CALL deleteReviewsByBook(?)", [bookId]);
    },

    deleteReviewsByUser: (userId) => {
        return knex.raw("CALL deleteReviewsByUser(?)", [userId]);
    },

    getRating: (reviewId) => {
        return knex.raw("CALL getRating(?)", [reviewId]);
    },

    changeTotalRating: (reviewId, oldRating, newRating, bookId) => {
        return knex.raw("CALL changeTotalRating(?, ?, ?, ?)", [reviewId, oldRating, newRating, bookId])
        .then(() => redis.hincrby(`books:${bookId}`, "totalRating", -oldRating))
        .then(() => redis.hincrby(`books:${bookId}`, "totalRating", newRating));
    },

    increaseTotalRating: (rating, bookId) => {
        return knex.raw("CALL increaseTotalRating(?, ?)", [rating, bookId])
        .then(() => redis.hincrby(`books:${bookId}`, "totalRating", rating))
        .then(() => redis.hincrby(`books:${bookId}`, "ratingCtr", 1));
    },

    decreaseTotalRating: (reviewId, rating, bookId) => {
        return knex.raw("CALL decreaseTotalRating(?, ?, ?)", [reviewId, rating, bookId])
        .then(() => redis.hincrby(`books:${bookId}`, "totalRating", -rating))
        .then(() => redis.hincrby(`books:${bookId}`, "ratingCtr", -1));
    },

    updateAverageRating: (bookId) => {
        let averageRating = 0;

        return knex.raw("CALL updateAverageRating(?)", [bookId])
        .then((val) => averageRating = val[0][0][0]['averageRating'])
        .then(() => redis.hset(`books:${bookId}`, "averageRating", averageRating));
    },

    getAverageRating: (bookId) => {
        return knex.raw("CALL getAverageRating(?)", [bookId]);
    }
};

module.exports = reviewsRepo;