const knex = require('./knex');

const topicsRepo = {
    getTopic: (topicId) => {
        return knex.raw("CALL getTopic(?)", [topicId]);
    },
    
    getTopics: () => {
        return knex.raw("CALL getTopics()");
    },

    getTopicsByFlair: (flair) => {
        return knex.raw("CALL getTopicsByFlair(?)", [flair]);
    },

    searchTopics: (searchParam) => {
        return knex.raw("CALL searchTopics(?)", [searchParam]);
    },

    addTopic: (newTopic, userId, userName) => {
        return knex.raw("CALL postTopic(?, ?, ?, ?, ?)", [newTopic.title, newTopic.content, newTopic.flair, userId, userName]);
    },

    editTopic: (topicId, updatedTopic) => {
        console.log("inside editTopic in topics repo");
        return knex.raw("CALL putTopic(?, ?, ?, ?)", [topicId, updatedTopic.title, updatedTopic.content, updatedTopic.flair]);
    },

    deleteTopic: (topicId) => {
        return knex.raw("CALL deleteTopic(?)", [topicId]);
    },
    
    increaseReplyCtr: (topicId) => {
        return knex.raw("CALL increaseReplyCtr(?)", [topicId]);
    },

    decreaseReplyCtr: (topicId) => {
        return knex.raw("CALL decreaseReplyCtr(?)", [topicId]);
    },
};

module.exports = topicsRepo;