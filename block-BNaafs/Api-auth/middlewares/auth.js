var jwt = require('jsonwebtoken')
module.exports = {
    varifyToken: (req, res, next) => {
        let token = req.headers.authorization
        try {
            if (token) {
                let payload = jwt.verify(token, process.env.PRIVATE_KEY)
                req.user = payload
               return next()
            } else {
                res.status(400).json({ error: "Token required" })
            }
        } catch (error) {
            next(error)
        }
    }
}