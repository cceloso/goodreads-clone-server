var express = require('express');
var router = express.Router();
const passport = require('passport');

const issueJWT = require('../lib/utils');
const usersRepo = require('../repositories/users.repository');

let userIndex = 1;

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
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

module.exports = router;