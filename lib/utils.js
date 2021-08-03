const jwt = require('jsonwebtoken');

const issueJWT = (user) => {
  
    const _id = user.id;
    const expiresIn = '1d';

    const payload = {
        sub: _id,
        iat: Date.now()
    };

    const PRIV_KEY = "secret";

    const signedToken = jwt.sign(payload, PRIV_KEY, { expiresIn: expiresIn });

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    }
}

module.exports = issueJWT;