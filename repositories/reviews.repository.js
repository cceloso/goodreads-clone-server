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

    updateTotalRating: (rating, bookId) => {
        return knex.raw("CALL updateTotalRating_flat(?, ?)", [rating, bookId])
        .finally(() => knex.destroy);
    },

    updateAverageRating: (bookId) => {
        return knex.raw("CALL updateAverageRating_flat(?)", [bookId])
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

module.exports = reviewsRepo;