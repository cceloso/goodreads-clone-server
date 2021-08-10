const responsesController = require('./responses.controller');

const topicsRepo = require('../repositories/topics.repository');
const usersRepo = require('../repositories/users.repository');

const url = require('url');

const controller = {
    getTopic: (req, res) => {
        topicsRepo.getTopic(req.params.topicId)
        .then((val) => {
            let topic = val[0][0];
            if(topic.length == 0) {
                responsesController.sendError(res, 404, "Topic not found.", "NOT_FOUND");
            } else {
                responsesController.sendData(res, 200, topic);
            }
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        });
    },

    getTopics: (req, res) => {
        topicsRepo.getTopics()
        .then((val) => {
            let topics = val[0][0];
            responsesController.sendData(res, 200, topics);
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        });
    },

    postTopic: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        const queryObject = url.parse(req.url, true).query;
        const userId = queryObject.userId;
        let userName = "";

        usersRepo.getUserById(userId)
        .then((val) => userName = val[0][0][0]['userName'])
        .then(() => topicsRepo.addTopic(req.body, userId, userName))
        .then(() => {
            responsesController.sendData(res, 201, {message: "Successfully added a forum topic."});
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        })
    },

    putTopic: (req, res) => {
        if(Object.keys(req.body).length === 0) {
            responsesController.sendError(res, 400, "Request body is empty.", "BAD_REQUEST");
        }

        topicsRepo.editTopic(req.params.topicId, req.body)
        .then(() => {
            responsesController.sendData(res, 200, {message: "Successfully edited topic."});
        })
        .catch((err) => {
            responsesController.sendError(res, 400, err, "BAD_REQUEST");
        })
    },

    deleteTopic: (req, res) => {
        topicsRepo.deleteTopic(req.params.topicId)
        .then(() => responsesController.sendData(res, 200, {message: "Successfully deleted topic."}))
        .catch((err) => responsesController.sendError(res, 400, err, "BAD_REQUEST"))
    }
};

module.exports = controller;