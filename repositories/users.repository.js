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

    // loginUser: (user) => {
    //     return knex.raw("CALL loginUser(?, ?)", [user.usernameOrEmail, user.password])
    //     .finally(() => knex.destroy);
    // },

    loginUser: (user) => {
        let correctPassword = "";

        knex.raw("CALL getUserByUsernameOrEmail(?)", [user.usernameOrEmail])
        .then((val) => {
            console.log("val:", val[0][0]);
            if(val[0][0].length != 0) {
                correctPassword = val[0][0][0]['password'];
            } else {
                throw("User does not exist.");
            }
            console.log(correctPassword);
        })
        .then(async () => {
            if (await bcrypt.compare(user.password, correctPassword)) {
                console.log("password is correct");
            } else {
                console.log("password is incorrect");
            }
        })
        .catch((err) => {
            console.log("inside catch in loginUser repo");
            console.log("err:", err);
        })
        .finally(() => knex.destroy);
    },

    // addUser: (userId, newUser) => {
    //     return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, newUser.password, newUser.imageUrl, "guest"])
    //     .finally(() => knex.destroy);
    // },

    addUser: async (userId, newUser) => {
        try {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            console.log(hashedPassword);
            return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, hashedPassword, newUser.imageUrl, "guest"])
            .finally(() => knex.destroy);
        } catch(err) {
            console.log("inside catch in addUser in repo");
            return err;
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