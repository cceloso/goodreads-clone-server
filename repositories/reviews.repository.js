const knex = require('./knex');
const redis = require('./redis');

const reviewsRepo = {
    getReview: (reviewId) => {
        return redis.hgetall(`reviews:${reviewId}`);
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

    addReview: (newReview, bookId, userId, userName) => {
        return knex.raw("CALL postReview(?, ?, ?, ?, ?)", [newReview.rating, newReview.review, bookId, userId, userName])
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
        return knex.raw("CALL putReview(?, ?, ?)", [reviewId, updatedReview.rating, updatedReview.review])
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
        return knex.raw("CALL deleteReview(?)", [reviewId])
        .then(() => redis.del(`reviews:${reviewId}`));
    },

    deleteReviewsByBook: (bookId) => {
        return knex.raw("CALL deleteReviewsByBook(?)", [bookId]);
    },

    deleteReviewsByUser: (userId) => {
        return knex.raw("CALL deleteReviewsByUser(?)", [userId]);
    },

    changeTotalRating: (reviewId, rating, bookId) => {
        return knex.raw("CALL changeTotalRating(?, ?, ?)", [reviewId, rating, bookId]);
    },

    increaseTotalRating: (rating, bookId) => {
        return knex.raw("CALL increaseTotalRating(?, ?)", [rating, bookId]);
    },

    decreaseTotalRating: (reviewId, bookId) => {
        return knex.raw("CALL decreaseTotalRating(?, ?)", [reviewId, bookId]);
    },

    updateAverageRating: (bookId) => {
        return knex.raw("CALL updateAverageRating(?)", [bookId]);
    }
};

module.exports = reviewsRepo;