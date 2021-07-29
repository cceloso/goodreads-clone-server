const responsesController = require('./responses.controller');
const reviewsRepo = require('../repositories/reviews.repository');
let reviewIndex = 1;

const controller = {
    getReview: (req, res) => {
        new Promise((resolve, reject) => {
            if(!req.params.reviewId) {
                console.log("from getAllReviews: ");
                reviewsRepo.getAllReviews(req.params.bookId)
                .then((val) => {
                    let reviews = val[0][0];
                    resolve(reviews);
                })
                .catch((err) => {
                    errorCode = 500;
                    reject(responsesController.createErrorMessage(500, err, "ERROR"));
                })
            }

            else {
                console.log("from getReview: ");
                reviewsRepo.getReview(req.params.reviewId)
                    .then((val) => {
                        let review = val[0][0];
                        if(review.length == 0) {
                            errorCode = 404;
                            reject(responsesController.createErrorMessage(404, "Review not found. Please provide a valid review id.", "NOT_FOUND"));
                        } else {
                            resolve(review);
                        }
                    })
                    .catch((err) => {
                        errorCode = 500;
                        reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                    })
            }
        })
        .then((reviewsToDisplay) => {
            res.status(200).json(reviewsToDisplay);
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
        })
    },

    postReview: (req, res) => {
        new Promise((resolve, reject) => {
            const expectedAttributes = 2;

            if(!req.body.data) {
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
                    let reviewId = reviewIndex;
                    const bookId = req.params.bookId;
                    const query = req.url.split('?')[1];
                    const urlParams = new URLSearchParams(query);
                    const userId = urlParams.get("userId");
                    console.log(`bookId: ${bookId}`);
                    console.log(`userId: ${userId}`);

                    // resolve();
                    console.log(`reviewIndex: ${reviewIndex}`);

                    reviewsRepo.addReview(reviewId, req.body.data, bookId, userId)
                    .then(() => {
                        reviewIndex++;
                        console.log(`nextReviewIndex: ${reviewIndex}`);
                        // console.log("success");
                        resolve();
                    })
                    .catch((err) => {
                        if(err.code == 'ER_DUP_ENTRY') {
                            let dupEntryMessage = err.sqlMessage.split(' ');
                            let dupEntryKey = dupEntryMessage[dupEntryMessage.length - 1];
                            errorCode = 409;

                            if(dupEntryKey == `'bookAndUser'`) {
                                reject(responsesController.createErrorMessage(409, "User already posted a review for the book.", "ALREADY_EXISTS"));
                            } else if(dupEntryKey == `'PRIMARY'`) {
                                reject(responsesController.createErrorMessage(409, "Review with that id already exists.", "ALREADY_EXISTS"));
                            }
                        }

                        else {
                            errorCode = 500;
                            reject(responsesController.createErrorMessage(500, err, "UNKNOWN"));
                        }
                    })
                }
            }
        })
        .then(() => {
            res.status(201).json({
                message: "Successfully added a review."
            });
        })
        .catch((errorMessage) => {
            res.status(errorCode).json(errorMessage);
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