const LocalStrategy = require('passport-local').Strategy;

const initialize = (passport) => {
    const authenticateUser = (usernameOrEmail, password, done) => {

    }
    passport.use(new LocalStrategy({ usernameField: 'usernameOrEmail' }, authenticateUser));
    passport.serializeUser((user, done) => { });
    passport.deserializeUser((id, done) => { });
};

// function initialize(passport) {
// }


module.exports = initialize;