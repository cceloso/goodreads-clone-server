const responsesController = require('./responses.controller');

const repliesRepo = require('../repositories/replies.repository');
const topicsRepo = require('../repositories/topics.repository');
const usersRepo = require('../repositories/users.repository');

const url = require('url');

const controller = {
    getReply: (req, res) => {
        repliesRepo.getReply(req.params.replyId, req.params.topicId)
        .then((val) => {
            let reply = val[0][0];
            if(reply.length == 0) {
                responsesController.sendError(res, 404, "Reply not found.", "NOT_FOUND");
            } else {
                responsesController.sendData(res, 200, reply);
            }
        })
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"));
    },

    getReplies: (req, res) => {
        repliesRepo.getReplies(req.params.topicId)
        .then((val) => {
            let replies = val[0][0];
            responsesController.sendData(res, 200, replies);
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        });
    },

    postReply: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        const topicId = req.params.topicId;
        const queryObject = url.parse(req.url, true).query;
        const userId = queryObject.userId;
        let userName = "";

        usersRepo.getUserById(userId)
        .then((val) => userName = val[0][0][0]['userName'])
        .then(() => repliesRepo.addReply(req.body.content, topicId, userId, userName))
        .then(() => topicsRepo.increaseReplyCtr(topicId))
        .then(() => {
            responsesController.sendData(res, 201, {message: "Successfully added a reply."});
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        })
    },

    putReply: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        repliesRepo.editReply(req.params.replyId, req.body.content, req.params.topicId)
        .then(() => responsesController.sendData(res, 200, {message: "Successfully edited reply."}))
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
    },

    deleteReply: (req, res) => {
        const topicId = req.params.topicId;

        repliesRepo.deleteReply(req.params.replyId, topicId)
        .then(() => topicsRepo.decreaseReplyCtr(topicId))
        .then(() => responsesController.sendData(res, 200, {message: "Successfully deleted reply."}))
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
    }
};

module.exports = controller;