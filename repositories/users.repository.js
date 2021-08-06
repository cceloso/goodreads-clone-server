const knex = require('./knex');
const redis = require('./redis');
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

    loginUser: (user) => {
        let correctPassword = "";
        let userObject;

        return new Promise((resolve, reject) => {
            knex.raw("CALL getUserByUsernameOrEmail(?)", [user.usernameOrEmail])
            .then((val) => {
                if(val[0][0].length != 0) {
                    userObject = val[0][0][0];
                    correctPassword = userObject.password;
                } else {
                    reject("user dne");
                }
                console.log("correctPassword:", correctPassword);
            })
            .then(async () => {
                if (await bcrypt.compare(user.password, correctPassword)) {
                    console.log("password is correct");
                    resolve(userObject);
                } else {
                    console.log("password is incorrect");
                    reject("incorrect pw");
                }
            });
        });
    },

    addUser: async (newUser) => {
        try {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            console.log("hashedPassword:", hashedPassword);
            return knex.raw("CALL postUser_new(?, ?, ?, ?, ?, ?, ?)", [newUser.firstname, newUser.lastname, newUser.username, newUser.email, hashedPassword, newUser.imageUrl, "guest"]);
        } catch(err) {
            console.log("inside catch in addUser in repo");
            console.log("err:", err);
            return err;
        }
    },
    
    // editUser: (userId, updatedUser) => {
    //     return knex.raw("CALL putUser(?, ?, ?, ?, ?, ?, ?)", [userId, updatedUser.firstname, updatedUser.lastname, updatedUser.username, updatedUser.email, updatedUser.password, updatedUser.imageUrl])
    //     .finally(() => knex.destroy);
    // },

    editUser: (updatedUser) => {
        let oldPassword = "";
        let newPassword = "";
        let oldUser;

        return new Promise((resolve, reject) => {
            knex.raw("CALL getUserByUsernameOrEmail(?)", [updatedUser.username])
            .then((val) => {
                if(val[0][0].length != 0) {
                    oldUser = val[0][0][0];
                    oldPassword = oldUser.password;
                } else {
                    reject("user dne");
                }
                console.log("oldPassword:", oldPassword);
            })
            .then(async () => {
                if (await bcrypt.compare(updatedUser.password, oldPassword)) {
                    newPassword = oldPassword;
                } else {
                    newPassword = await bcrypt.hash(updatedUser.password, 10);
                }

                knex.raw("CALL putUser_new(?, ?, ?, ?, ?, ?, ?)", [oldUser.id, updatedUser.firstname, updatedUser.lastname, updatedUser.username, updatedUser.email, newPassword, updatedUser.imageUrl])
                .then(() => resolve());
            })
        });
    },

    deleteUser: (userId) => {
        return knex.raw("CALL deleteUser_new(?)", [userId]);
    }
};

module.exports = usersRepo;