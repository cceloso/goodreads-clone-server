const responsesController = require('./responses.controller');
const reviewsRepo = require('../repositories/reviews.repository');
const usersRepo = require('../repositories/users.repository');
let reviewIndex = 1;

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
            .then((val) => {
                let review = val[0][0];
                if(review.length == 0) {
                    errorCode = 404;
                    res.status(errorCode).json(responsesController.createErrorMessage(404, "Review not found. Please provide a valid review id.", "NOT_FOUND"));
                } else {
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
        console.log(`bookId: ${bookId}`);
        console.log(`userId: ${userId}`);

        usersRepo.getUserById(userId)  
        .then((val) => {
            userName = val[0][0][0]['userName'];
            console.log("userName:", userName);
        })
        .then(() => reviewsRepo.addReview(req.body, bookId, userId, userName))
        .then(() => reviewsRepo.updateTotalRating(req.body.rating, bookId))
        .then(() => reviewsRepo.updateAverageRating(bookId))
        .then(() => {
            res.status(201).json({
                message: "Successfully added a review."
            });
        })
        // .then(() => {
        //     reviewsRepo.addReview(req.body, bookId, userId, userName)
        //     .then(() => {
        //         res.status(201).json({
        //             message: "Successfully added a review."
        //         });
        //     })
        // })
        .catch((err) => {
            res.status(400).json(responsesController.createErrorMessage(400, err, "error in posting review"));
        })
    },

    putReview: (req, res) => {
        new Promise((resolve, reject) => {
            const expectedAttributes = 2;

            if(!req.params.reviewId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Review id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            else if(!req.body.data) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Body of request is empty. Please pass valid body data.", "INVALID_ARGUMENT"));
            }

            else {
                if(Object.keys(req.body.data).length < expectedAttributes) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has incomplete attributes.", "INVALID_ARGUMENT"));
                } else if(Object.keys(req.body.data).length > expectedAttributes) {
                    errorCode = 400;
                    reject(responsesController.createErrorMessage(400, "Request body data has extra attributes.", "INVALID_ARGUMENT"));
                } else {
                    reviewsRepo.editReview(req.params.reviewId, req.body.data, req.params.bookId)
                    .then((val) => {
                        if(val[0][1].affectedRows == 0) {
                            errorCode = 404;
                            reject(responsesController.createErrorMessage(404, "Review not found. Please pass a valid review id.", "NOT_FOUND"));
                        } else {
                            resolve();
                        }
                    })
                    .catch((err) => {
                        errorCode = 500;
                        reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                    })
                }
            }
        })
        .then(() => {
            res.status(200).json({
                message: `Successfully edited review.`
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    deleteReview: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.reviewId) {
                errorCode = 400;
                reject(responsesController.createErrorMessage(400, "Review id parameter is empty. Please pass valid parameter.", "INVALID_ARGUMENT"));
            }

            else {
                reviewsRepo.deleteReview(req.params.reviewId, req.params.bookId)
                .then((val) => {
                    if(val[0][1].affectedRows == 0) {
                        errorCode = 404;
                        reject(responsesController.createErrorMessage(404, "Review not found. Please pass a valid review id.", "NOT_FOUND"));
                    } else {
                        resolve();
                    }
                })
                .catch((err) => {
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                })
            }
        })
        .then(() => {
            res.status(200).json({
                message: `Successfully deleted review.`,
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    }
};

module.exports = controller;