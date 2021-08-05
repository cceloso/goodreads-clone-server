const responsesController = require('./responses.controller');
const reviewsRepo = require('../repositories/reviews.repository');
const commentsRepo = require('../repositories/comments.repository');
const usersRepo = require('../repositories/users.repository');

const controller = {
    getReview: (req, res) => {
        if(!req.params.reviewId) {
            console.log("from getReviews: ");
            reviewsRepo.getReviews(req.params.bookId)
            .then((val) => {
                let reviews = val[0][0];
                res.status(200).json(reviews);
            })
            .catch((err) => {
                errorCode = 500;
                res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "ERROR"));
            })
        } else {
            console.log("from getReview: ");
            reviewsRepo.getReview(req.params.reviewId)
            .then((review) => {
                if(Object.keys(review).length === 0) {
                    console.log("review not found");
                    errorCode = 404;
                    res.status(errorCode).json(responsesController.createErrorMessage(404, "Review not found. Please provide a valid review id.", "NOT_FOUND"));
                } else {
                    console.log("review found");
                    res.status(200).json(review);
                }
            })
            .catch((err) => {
                errorCode = 500;
                res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "ERROR"));
            })
        }
    },

    postReview: (req, res) => {
        const bookId = req.params.bookId;
        const query = req.url.split('?')[1];
        const urlParams = new URLSearchParams(query);
        const userId = urlParams.get("userId");
        let userName = "";
        console.log(`bookId: ${bookId}, typeof: ${typeof bookId}`);
        console.log(`userId: ${userId}, typeof: ${typeof userId}`);

        usersRepo.getUserById(userId)  
        .then((val) => {
            userName = val[0][0][0]['userName'];
            console.log("userName:", userName);
        })
        .then(() => reviewsRepo.addReview(req.body, bookId, userId, userName))
        .then(() => reviewsRepo.increaseTotalRating(req.body.rating, bookId))
        .then(() => reviewsRepo.updateAverageRating(bookId))
        .then(() => {
            res.status(201).json({
                message: "Successfully added a review."
            });
        })
        .catch((err) => {
            res.status(400).json(responsesController.createErrorMessage(400, err, "error in posting review"));
        })
    },

    putReview: (req, res) => {
        const reviewId = req.params.reviewId;
        const updatedReview = req.body;
        const bookId = req.params.bookId;

        reviewsRepo.changeTotalRating(reviewId, updatedReview.rating, bookId)
        .then(() => reviewsRepo.updateAverageRating(bookId))
        .then(() => reviewsRepo.editReview(reviewId, updatedReview))
        .then(() => {
            res.status(200).json({
                message: `Successfully edited review.`
            });
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(errorCode, err, "UNKNOWN"));
        })
    },

    deleteReview: (req, res) => {
        const reviewId = req.params.reviewId;
        const bookId = req.params.bookId;

        reviewsRepo.decreaseTotalRating(reviewId, bookId)
        .then(() => reviewsRepo.updateAverageRating(bookId))
        .then(() => reviewsRepo.deleteReview(reviewId))
        .then(() => console.log("deleted reviews"))
        .then(() => commentsRepo.deleteCommentsByReview(reviewId))
        .then((val) => {
            console.log("deleted comments too");
            res.status(200).json({
                message: `Successfully deleted review.`,
            });
        })
        .catch((err) => {
            errorCode = 500;
            res.status(errorCode).json(responsesController.createErrorMessage(500, err, "UNKNOWN"));
        })
    }
};

module.exports = controller;