const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const jwt_token = req.headers.authorization;
        jwt.verify(jwt_token, 'SECRET', function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    status: 401,
                    "error": true,
                    msg: 'UNAUTHORIZED ACCESS'
                })
            } else {
                console.log(decoded.payload)
                req.decoded = decoded
                next();
            }
        })
    } catch (error) {
        return res.status(401).json({
            msg: "auth failed"
        })
    }

}