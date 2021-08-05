const knex = require('./knex');
const redis = require('./redis');

const reviewsRepo = {
    // getAllReviews: (bookId) => {
    //     return knex.raw("CALL getAllReviews(?)", [bookId])
    //     .finally(() => knex.destroy);
    // },

    getReviews: (bookId) => {
        return knex.raw("CALL getReviews(?)", [bookId])
        .finally(() => knex.destroy);
    },

    getReview: (reviewId) => {
        // return knex.raw("CALL getReview(?)", [reviewId])
        // .finally(() => knex.destroy);
        return redis.hgetall(`reviews:${reviewId}`);
    },

    // addReview: (reviewId, newReview, bookId, userId) => {
    //     return knex.raw("CALL postReview(?, ?, ?, ?, ?)", [reviewId, newReview.rating, newReview.review, bookId, userId])
    //     .finally(() => knex.destroy);
    // },

    addReview: (newReview, bookId, userId, userName) => {
        return knex.raw("CALL postReview_flat(?, ?, ?, ?, ?)", [newReview.rating, newReview.review, bookId, userId, userName])
        .then((val) => {
            const reviewObject = val[0][0][0];
            // console.log("reviewObject:", reviewObject);

            const redisObject = {
                id: reviewObject.id,
                rating: reviewObject.rating,
                review: reviewObject.review,
                dateCreated: reviewObject.dateCreated,
                bookId: reviewObject.bookId,
                userId: reviewObject.userId,
                userName: reviewObject.userName
            };

            redis.hmset(`reviews:${reviewObject.id}`, redisObject);
        })
    },

    editReview: (reviewId, updatedReview) => {
        return knex.raw("CALL putReview_flat(?, ?, ?)", [reviewId, updatedReview.rating, updatedReview.review]);
    },

    deleteReview: (reviewId) => {
        return knex.raw("CALL deleteReview_flat(?)", [reviewId]);
    },

    changeTotalRating: (reviewId, rating, bookId) => {
        return knex.raw("CALL changeTotalRating_flat(?, ?, ?)", [reviewId, rating, bookId]);
    },

    increaseTotalRating: (rating, bookId) => {
        return knex.raw("CALL increaseTotalRating_flat(?, ?)", [rating, bookId]);
    },

    decreaseTotalRating: (reviewId, bookId) => {
        return knex.raw("CALL decreaseTotalRating_flat(?, ?)", [reviewId, bookId]);
    },

    updateAverageRating: (bookId) => {
        return knex.raw("CALL updateAverageRating_flat(?)", [bookId]);
    }
};

module.exports = reviewsRepo;