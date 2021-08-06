const reviewsRepo = require('../repositories/reviews.repository');
const commentsRepo = require('../repositories/comments.repository');

const controller = {
    deleteReviewSubprocesses: (reviewId, bookId) => {
        return reviewsRepo.decreaseTotalRating(reviewId, bookId)
        .then(() => reviewsRepo.updateAverageRating(bookId))
        .then(() => reviewsRepo.deleteReview(reviewId))
        .then(() => commentsRepo.deleteCommentsByReview(reviewId))
    }
};

module.exports = controller;