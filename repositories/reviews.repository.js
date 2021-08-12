const knex = require('./knex');
const redis = require('./redis');

const reviewsRepo = {
    getReview: (reviewId) => {
        return redis.hgetall(`reviews:${reviewId}`);
    },

    getReviewByUserAndBook: (userId, bookId) => {
        console.log("inside getReviewByUserAndBook");
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
        return knex.raw("CALL postReview(?, ?, ?, ?, ?, ?, ?)", [newReview.rating, newReview.review, bookId, title, author, userId, userName])
        .then((val) => {
            const reviewObject = val[0][0][0];
            // console.log("reviewObject:", reviewObject);

            const redisObject = {
                id: reviewObject.id,
                rating: reviewObject.rating,
                review: reviewObject.review,
                dateCreated: reviewObject.dateCreated,
                bookId: reviewObject.bookId,
                title: reviewObject.title,
                author: reviewObject.author,
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
    }
};

module.exports = reviewsRepo;