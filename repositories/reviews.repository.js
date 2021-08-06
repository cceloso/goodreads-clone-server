const knex = require('./knex');
const redis = require('./redis');

const reviewsRepo = {
    getReview: (reviewId) => {
        return redis.hgetall(`reviews:${reviewId}`);
    },

    getReviews: (bookId) => {
        return knex.raw("CALL getReviews_flat(?)", [bookId]);
    },

    getReviewsByUser: (userId) => {
        return knex.raw("CALL getReviewsByUser_flat(?)", [userId]);
    },

    getReviewerById: (reviewId) => {
        return knex.raw("CALL getReviewerById_flat(?)", [reviewId]);
    },

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
        });
    },

    editReview: (reviewId, updatedReview) => {
        return knex.raw("CALL putReview_flat(?, ?, ?)", [reviewId, updatedReview.rating, updatedReview.review])
        .then((val) => {
            if(val[0].affectedRows === 0) {
                throw "Review not found. Please pass a valid review id.";
            } else {
                const redisObject = {
                    rating: updatedReview.rating,
                    review: updatedReview.review
                };

                redis.hmset(`reviews:${reviewId}`, redisObject);
            }
        });
    },

    deleteReview: (reviewId) => {
        return knex.raw("CALL deleteReview_flat(?)", [reviewId])
        .then(() => redis.del(`reviews:${reviewId}`));
    },

    deleteReviewsByBook: (bookId) => {
        return knex.raw("CALL deleteReviewsByBook_flat(?)", [bookId]);
    },

    deleteReviewsByUser: (userId) => {
        return knex.raw("CALL deleteReviewsByUser_flat(?)", [userId]);
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