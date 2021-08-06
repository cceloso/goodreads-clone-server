var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "You are successfully authenticated to this route!"
    });
});

module.exports = router;