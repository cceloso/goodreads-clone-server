const knex = require('./knex');
const redis = require('./redis');
const bcrypt = require('bcrypt');

const usersRepo = {
    getUser: (userId) => {
        return redis.hgetall(`users:${userId}`);
    },

    getAllUsers: () => {
        return knex.raw("CALL getAllUsers()")
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
                    reject("Invalid user.");
                }
                console.log("correctPassword:", correctPassword);
            })
            .then(async () => {
                if (await bcrypt.compare(user.password, correctPassword)) {
                    console.log("password is correct");
                    resolve(userObject);
                } else {
                    console.log("password is incorrect");
                    reject("Invalid password.");
                }
            });
        });
    },

    addUser: async (newUser) => {
        try {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            console.log("hashedPassword:", hashedPassword);
            
            return new Promise((resolve, reject) => {
                knex.raw("CALL postUser(?, ?, ?, ?, ?, ?, ?)", [newUser.firstname, newUser.lastname, newUser.username, newUser.email, hashedPassword, newUser.imageUrl, "guest"])
                .then((val) => {
                    const userObject = val[0][0][0];
                    const redisObject = {
                        id: userObject.id,
                        firstName: userObject.firstName,
                        lastName: userObject.lastName,
                        userName: userObject.userName,
                        email: userObject.email,
                        password: userObject.password,
                        dateCreated: userObject.dateCreated,
                        imageUrl: userObject.imageUrl,
                        role: userObject.role,
                    };

                    console.log("redisObject:", redisObject);

                    redis.hmset(`users:${userObject.id}`, redisObject);
                    
                    resolve(userObject);
                })
                .catch((err) => {
                    // console.log("err in repo:", err);
                    reject(err);
                });
            });
            
        } catch(err) {
            console.log("inside catch in addUser in repo");
            console.log("err:", err);
            return err;
        }
    },

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

                knex.raw("CALL putUser(?, ?, ?, ?, ?, ?, ?)", [oldUser.id, updatedUser.firstname, updatedUser.lastname, updatedUser.username, updatedUser.email, newPassword, updatedUser.imageUrl])
                .then((val) => {
                    const userObject = val[0][0][0];
                    const redisObject = {
                        id: userObject.id,
                        firstName: userObject.firstName,
                        lastName: userObject.lastName,
                        userName: userObject.userName,
                        email: userObject.email,
                        password: userObject.password,
                        dateCreated: userObject.dateCreated,
                        imageUrl: userObject.imageUrl,
                        role: userObject.role,
                    };
                    redis.hmset(`users:${userObject.id}`, redisObject);
                })
                .then(() => resolve());
            })
        });
    },

    deleteUser: (userId) => {
        return knex.raw("CALL deleteUser(?)", [userId])
        .then(() => redis.del(`users:${userId}`));
    }
};

module.exports = usersRepo;