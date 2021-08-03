// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;

// const bcrypt = require('bcrypt');
// const usersRepo = require('./repositories/users.repository');
// const knex = require('./repositories/knex');

// passport.use(new LocalStrategy({
//         usernameField: 'usernameOrEmail',
//         passwordField: 'password'
//     }, 
//     function (usernameOrEmail, password, cb) {
//         let user;
//         let correctPassword = "";

//         knex.raw("CALL getUserByUsernameOrEmail(?)", [usernameOrEmail])
//         .then((val) => {
//             // console.log("val:", val[0][0]);
//             if(val[0][0].length != 0) {
//                 user = val[0][0][0];
//                 correctPassword = user['password'];
//                 console.log(correctPassword);
//             } else {
//                 console.log("User does not exist.");
//                 return cb(null, false, {message: "User does not exist."});
//             }
//         })
//         .then(async () => {
//             if (await bcrypt.compare(password, correctPassword)) {
//                 console.log("Password is correct.");
//                 return cb(null, user, {message: "Logged in successfully."});
//             } else {
//                 console.log("Password is incorrect.");
//                 return cb(null, false, {message: "Password is incorrect."});
//             }
//         })
//         .catch((err) => {
//             console.log("inside catch in loginUser repo");
//             console.log("err:", err);
//             cb(err);
//         })
//         .finally(() => knex.destroy);
//     }
// ));