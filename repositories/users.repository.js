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

    getUserById: (userId) => {
        console.log("inside getUserById");
        console.log("userId:", userId);
        return knex.raw("CALL getUserById(?)", [userId])
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
            // console.log("val:", val[0][0]);
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
                return true;
            } else {
                console.log("password is incorrect");
                return false;
            }
        })
        .catch((err) => {
            console.log("inside catch in loginUser repo");
            console.log("err:", err);
            return false;
        })
        .finally(() => knex.destroy);
    },
    
    loginUser2: (user) => {
        let correctPassword = "";
        let userObject;

        return new Promise((resolve, reject) => {
            knex.raw("CALL getUserByUsernameOrEmail(?)", [user.usernameOrEmail])
            .then((val) => {
                // console.log("val:", val[0][0]);
                if(val[0][0].length != 0) {
                    userObject = val[0][0][0];
                    correctPassword = userObject.password;
                } else {
                    // throw("User does not exist.");
                    reject("user dne");
                }
                console.log(correctPassword);
            })
            .then(async () => {
                if (await bcrypt.compare(user.password, correctPassword)) {
                    console.log("password is correct");
                    // return userObject;
                    resolve(userObject);
                } else {
                    console.log("password is incorrect");
                    // return undefined;
                    reject("incorrect pw");
                }
            })
            .catch((err) => {
                console.log("inside catch in loginUser repo");
                console.log("err:", err);
                // return undefined;
                reject(err);
            })
            .finally(() => knex.destroy);
        });
    },

    // addUser: (userId, newUser) => {
    //     return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, newUser.password, newUser.imageUrl, "guest"])
    //     .finally(() => knex.destroy);
    // },

    // addUser: async (userId, newUser) => {
    //     try {
    //         const hashedPassword = await bcrypt.hash(newUser.password, 10);
    //         console.log(hashedPassword);
    //         return knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?, ?)", [userId, newUser.firstname, newUser.lastname, newUser.username, newUser.email, hashedPassword, newUser.imageUrl, "guest"])
    //         .finally(() => knex.destroy);
    //     } catch(err) {
    //         console.log("inside catch in addUser in repo");
    //         return err;
    //     }
    // },

    addUser: async (newUser) => {
        try {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            console.log(hashedPassword);
            return knex.raw("CALL postUser_new(?, ?, ?, ?, ?, ?, ?)", [newUser.firstname, newUser.lastname, newUser.username, newUser.email, hashedPassword, newUser.imageUrl, "guest"])
            .finally(() => knex.destroy);
        } catch(err) {
            console.log("inside catch in addUser in repo");
            console.log("err:", err);
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