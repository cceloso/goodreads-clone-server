const knex = require('./knex');
const bcrypt = require('bcrypt');

const usersRepo = {
    getAllUsers: () => {
        return knex.raw("CALL getAllUsers()")
        .finally(() => knex.destroy);
    },

    getUser: (user) => {
        return knex.raw("CALL getUser(?, ?)", [user.username, user.password])
        .finally(() => knex.destroy);
    },

    loginUser: (user) => {
        return knex.raw("CALL loginUser(?, ?)", [user.usernameOrEmail, user.password])
        .finally(() => knex.destroy);
    },

    // addUser: (userId, newUser) => {
    //     return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, newUser.password, newUser.imageUrl, "guest"])
    //     .finally(() => knex.destroy);
    // },

    // addUser: (userId, newUser, password) => {
    //     return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, password, newUser.imageUrl, "guest"])
    //     .finally(() => knex.destroy);
    // },

    addUser: async (userId, newUser) => {
        try {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            console.log(hashedPassword);
            return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, hashedPassword, newUser.imageUrl, "guest"])
            .finally(() => knex.destroy);
        } catch {
            console.log("inside catch");
            return;
        }
    },
    
    editUser: (userId, updatedUser) => {
        return knex.raw("CALL putUser(?, ?, ?, ?, ?, ?, ?)", [userId, updatedUser.firstname, updatedUser.lastname, updatedUser.username, updatedUser.email, updatedUser.password, updatedUser.imageUrl])
        .finally(() => knex.destroy);
    },

    deleteUser: (userId) => {
        return knex.raw("CALL deleteUser(?)", [userId])
        .finally(() => knex.destroy);
    },

    getReviewsByUser: (userId) => {
        return knex.raw("CALL getReviewsByUser(?)", [userId])
        .finally(() => knex.destroy);
    }
};

module.exports = usersRepo;