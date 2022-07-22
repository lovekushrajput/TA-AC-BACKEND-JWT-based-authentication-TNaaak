let jwt = require('jsonwebtoken')

module.exports = {
    varifyToken: async (req, res, next) => {
        let token = req.headers.authorization
        try {
            if (token) {
                let result = await jwt.verify(token, process.env.PRIVATE_KEY)
                req.users = result
                next()
            } else {
                res.status(400).json({ message: 'Token required' })
            }

        } catch (error) {
            next(error)
        }

    }
}