const jwt = require('jsonwebtoken');
const url = require('url');

module.exports = (socket) => {
    const responsesController = require('./responses.controller');
    
    const booksRepo = require('../repositories/books.repository');
    const commentsRepo = require('../repositories/comments.repository');
    const reviewsRepo = require('../repositories/reviews.repository');
    const usersRepo = require('../repositories/users.repository');

    const deleteReviewSubprocesses = (reviewId, bookId) => {
        let rating = 0;
    
        return reviewsRepo.getRating(reviewId)
        .then((val) => rating = val[0][0][0]['rating'])
        .then(() => reviewsRepo.decreaseTotalRating(reviewId, rating, bookId))
        .then(() => reviewsRepo.updateAverageRating(bookId))
        .then(() => reviewsRepo.deleteReview(reviewId))
        .then(() => commentsRepo.deleteCommentsByReview(reviewId))
    };

    return {
        getReview: (req, res) => {
            reviewsRepo.getReview(req.params.reviewId)
            .then((review) => {
                if(Object.keys(review).length === 0) {
                    responsesController.sendError(res, 404, "Review not found.", "NOT_FOUND");
                } else {
                    responsesController.sendData(res, 200, review);
                }
            })
            .catch((err) => {
                responsesController.sendError(res, 400, err, "BAD_REQUEST");
            })
        },
    
        getReviews: (req, res) => {
            const queryObject = url.parse(req.url, true).query;
            const userId = queryObject.userId;
            
            if(userId == undefined) {
                reviewsRepo.getReviews(req.params.bookId)
                .then((val) => {
                    let reviews = val[0][0];
                    responsesController.sendData(res, 200, reviews);
                })
                .catch((err) => {
                    responsesController.sendError(res, 400, err, "BAD_REQUEST");
                })    
            } else {
                reviewsRepo.getReviewByUserAndBook(userId, req.params.bookId)
                .then((val) => {
                    if(val[0][0].length == 0) {
                        responsesController.sendData(res, 200, false);
                    } else {
                        responsesController.sendData(res, 200, true);
                    }
                })
            }
        },
    
        getReviewsByUser: (req, res) => {
            reviewsRepo.getReviewsByUser(req.params.userId)
            .then((val) => {
                let reviews = val[0][0];
                responsesController.sendData(res, 200, reviews);
            })
            .catch((err) => {
                responsesController.sendError(res, 400, err, "BAD_REQUEST");
            })
        },
    
        postReview: (req, res) => {
            if(Object.keys(req.body).length === 0) {
                responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
            }
    
            const bookId = req.params.bookId;
            const queryObject = url.parse(req.url, true).query;
            const userId = queryObject.userId;
            let userName = "";
            let title = "";
            let author = "";
            let averageRating = 0;
    
            usersRepo.getUserById(userId)
            .then((val) => userName = val[0][0][0]['userName'])
            .then(() => booksRepo.getTitleAndAuthor(bookId))
            .then((val) => {
                let titleAndAuthor = val[0][0][0];
                title = titleAndAuthor.title;
                author = titleAndAuthor.author;
            })
            .then(() => reviewsRepo.increaseTotalRating(req.body.rating, bookId))
            .then(() => reviewsRepo.updateAverageRating(bookId))
            .then(() => reviewsRepo.getAverageRating(bookId))
            .then((val) => averageRating = val[0][0][0].averageRating)
            .then(() => reviewsRepo.addReview(req.body, bookId, title, author, userId, userName))
            .then((val) => {
                const reviewObject = val[0][0][0];
                const room = `bookUpdate-${bookId}`;

                socket.broadcast(room, "newReview", {reviewObject: reviewObject, averageRating: averageRating});

                responsesController.sendData(res, 201, reviewObject);
            })
            .catch((err) => {
                if(err.code === "ER_DUP_ENTRY") {
                    responsesController.sendError(res, 409, "User has already written a review for the book.", "DUPLICATE_ENTRY");
                } else {
                    responsesController.sendError(res, 400, err, "BAD_REQUEST");
                }
            })
        },
    
        putReview: (req, res) => {
            if(Object.keys(req.body).length === 0) {
                responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
            }
    
            const reviewId = req.params.reviewId;
            const updatedReview = req.body;
            const bookId = req.params.bookId;
            const newRating = updatedReview.rating;
            let oldRating = 0;
            let averageRating = 0;
    
            reviewsRepo.getRating(reviewId)
            .then((val) => oldRating = val[0][0][0]['rating'])
            .then(() => reviewsRepo.changeTotalRating(reviewId, oldRating, newRating, bookId))
            .then(() => reviewsRepo.updateAverageRating(bookId))
            .then(() => reviewsRepo.getAverageRating(bookId))
            .then((val) => averageRating = val[0][0][0].averageRating)
            .then(() => reviewsRepo.editReview(reviewId, updatedReview))
            .then((val) => {
                const reviewObject = val[0][0][0];
                const room = `bookUpdate-${bookId}`;

                socket.broadcast(room, "updatedReview", {reviewObject: reviewObject, averageRating: averageRating});

                responsesController.sendData(res, 200, reviewObject);
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
        },
    
        deleteReview: (req, res) => {
            const reviewId = req.params.reviewId;
            const bookId = req.params.bookId;
            const queryObject = url.parse(req.url, true).query;
            const userId = queryObject.userId;
            let averageRating = 0;
    
            deleteReviewSubprocesses(reviewId, bookId)
            .then(() => reviewsRepo.getAverageRating(bookId))
            .then((val) => averageRating = val[0][0][0].averageRating)
            .then(() => {
                const room = `bookUpdate-${bookId}`;

                socket.broadcast(room, "removedReview", {reviewId: reviewId, userId: userId, averageRating: averageRating});

                responsesController.sendData(res, 200, {message: "Successfully deleted review."});
            })
            .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
        },
    
        deleteReviewsByUser: (reviews) => {
            let reviewId;
            let bookId;
    
            for(let i = 0; i < reviews.length; i++) {
                reviewId = reviews[i]['id'];
                bookId = reviews[i]['bookId'];
    
                deleteReviewSubprocesses(reviewId, bookId);
            }
        }
    }
}
