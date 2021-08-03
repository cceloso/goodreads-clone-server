var express = require('express');
var router = express.Router();
const passport = require('passport');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const JwtStrategy = require('passport-jwt').Strategy
// const ExtractJwt = require('passport-jwt').ExtractJwt;

const issueJWT = require('../lib/utils');
const usersRepo = require('../repositories/users.repository');

let userIndex = 1;

router.get('/protected', passport.authenticate('jwt', { session: false}), (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "You are successfully authenticated to this route!"
    });
});

router.post('/login', (req, res, next) => {
    console.log("inside login router");

    usersRepo.loginUser2(req.body)
    .then((userObject) => {
        // console.log("userObject:", userObject);
        const tokenObject = issueJWT(userObject);
        console.log("tokenObject:", tokenObject);

        res.status(200).json({
            success: true,
            token: tokenObject.token,
            expiresIn: tokenObject.expires
        });
    })
    .catch((err) => {
        console.error(err);
        res.status(400).json({
            error: err
        });
    })
});

router.post('/signup', (req, res, next) => {
    const userId = userIndex;

    usersRepo.addUser(userId, req.body)
    .then((val) => {
        userIndex++;
        let user = val[0][0][0];

        res.status(201).json({
            success: true,
            user: user
        })
    })
    .catch((err) => {
        next(err);
    })
});

// /*   user */
// router.post('/', (req, res, next) => {
    
//     let correctPassword = "";
//     let user = req.body;

//     knex.raw("CALL getUserByUsernameOrEmail(?)", [user.usernameOrEmail])
//     .then((val) => {
//         // console.log("val:", val[0][0]);
//         if(val[0][0].length != 0) {
//             correctPassword = val[0][0][0]['password'];
//         } else {
//             throw("User does not exist.");
//         }
//         console.log(correctPassword);
//     })
//     .then(async () => {
//         if (await bcrypt.compare(user.password, correctPassword)) {
//             console.log("password is correct");
//         } else {
//             console.log("password is incorrect");
//         }
//     })
//     .catch((err) => {
//         console.log("inside catch in loginUser repo");
//         console.log("err:", err);
//     })
//     .finally(() => knex.destroy);
    
//     // try {
//     //     const isUserValid = await usersRepo.loginUser(req.body);
//     //     if()
//     //     console.log("isUserValid:", isUserValid);
//     //     res.status(201).json({
//     //         message: "Successful login"
//     //     });
//     // } catch {
//     //     console.log("error");
//     //     res.status(500).json({
//     //         message: "Login failed",
//     //         error: err
//     //     });
//     // }

//     // new Promise((resolve, reject) => {
//     //     let isUserValid = false;
//     //     isUserValid = usersRepo.loginUser(req.body);
//     //     // console.log("isUserValid:", isUserValid);
//     //     // resolve("test2");
//     //     resolve(isUserValid);
//     // })
//     // .then((successMessage) => {
//     //     console.log("isUserValid:", isUserValid);
        
//     //     res.status(201).json({
//     //         message: "Successful login"
//     //     });
//     // })
//     // .catch((err) => {
//     //     console.error(error);
//     //     res.status(500).json({
//     //         message: "Login failed",
//     //         error: err
//     //     });
//     // })
// });

module.exports = router;