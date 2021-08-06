const jwt = require('jsonwebtoken');

const issueJWT = (user) => {
    const _id = user.id;
    const expiresIn = '1d';

    const payload = {
        sub: _id,
        iat: Date.now()
    };

    const signedToken = jwt.sign(payload, "secret", { expiresIn: expiresIn });

    return {
        token: "Bearer " + signedToken,
        expires: expiresIn
    };
}

module.exports = issueJWT;