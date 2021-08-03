const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const fs = require('fs');
const path = require('path');

const usersRepo = require('./repositories/users.repository');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: "secret"
};

module.exports = (passport) => {
    passport.use(new JwtStrategy(options, function(jwt_payload, done) {
        usersRepo.getUserById(jwt_payload.sub)
        .then((val) => {
            let user = val[0][0][0];
            console.log("user authorized");
            return done(null, user);
        })
        .catch((err) => {
            console.log("user not authorized");
            return done(err, false);
        })
    }));
}