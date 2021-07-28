const commonRepo = require('./common.repository');
const knex = require('./knex');
const { nanoid } = require('nanoid');

const usersRepo = {
    getAllUsers: () => {
        return knex.raw("CALL getAllUsers()")
        .finally(() => knex.destroy);
    },

    getUser: (userId) => {
        console.log(`userId: ${userId}`);
        return knex.raw("CALL getUser(?)", [userId])
        .finally(() => knex.destroy);
    },

    zeroFill: (i) => {
        return (i < 10 ? '0' : '') + i;
    },

    searchUserIndex: (id) => {
        return commonRepo.searchIndex(id, users);
    },

    userAlreadyExists: (newUser) => {
        const filteredUsername = users.filter(user => user.username == newUser.username);
        const filteredEmail = users.filter(user => user.email == newUser.email);
        
        if(filteredUsername.length != 0) {
            return 1;
        } else if(filteredEmail != 0) {
            return 2;
        } else {
            return 0;
        }
    },

    addUser: (userId, newUser) => {
        return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, newUser.password, newUser.imageUrl, "guest"])
        .finally(() => knex.destroy);
    },
    
    editUser: (userId, updatedUser) => {
        return knex.raw("CALL putUser(?, ?, ?, ?, ?, ?, ?)", [userId, updatedUser.firstname, updatedUser.lastname, updatedUser.username, updatedUser.email, updatedUser.password, updatedUser.imageUrl])
        .finally(() => knex.destroy);
    },

    deleteUser: (userId) => {
        return knex.raw("CALL deleteUser(?)", [userId])
        .finally(() => knex.destroy);
    },
};

module.exports = usersRepo;