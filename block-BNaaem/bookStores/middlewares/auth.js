let jwt = require('jsonwebtoken')
module.exports = {
    varifyToken: async (req, res, next) => {
        let token = req.headers.authorization
        try {
            if (token) {
                let payload = await jwt.verify(token, process.env.PRIVATE_KEY)
                req.users = payload
                next()
            } else {
                res.status(400).json({ message: 'Token Required' })
            }

        } catch (error) {
            console.log(error);
            next(error)
        }
    }
}