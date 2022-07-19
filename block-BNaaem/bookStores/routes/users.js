var express = require('express');
var router = express.Router();
var Book = require('../models/Book')
var User = require('../models/User')
var auth = require('../middlewares/auth')

router.post('/register', (req, res, next) => {
    User.create(req.body, (err, user) => {
        if (err) return next(err)
        res.json({ user })
    })
})


router.post('/login', async (req, res, next) => {
    let { email, password } = req.body

    try {
        if (!email || !password) {
            return res.json({ message: 'Email/Password is requred' })
        }
        let user = await User.findOne({ email })
        if (!user) {
            return res.json({ message: 'Invalid Email' })
        }

        let result = await user.varifyPassword(password)
        if (!result) {
            return res.json({ message: 'wrong Password' })
        }
        //generate token
        let token = await user.signToken()
        res.json({ user: user.userJSON(token) })

    } catch (error) {
        next(error)
    }
})



router.post('/:id/books/new', auth.varifyToken, async (req, res, next) => {
    let id = req.params.id
    req.body.userId = id
    req.body.category = req.body.category.split(',')
    try {
        let book = await Book.create(req.body)
        let user = await User.findByIdAndUpdate(id, { $push: { bookId: book.id } })
        res.redirect('/api/Books')
    } catch (error) {
        return next(error)
    }
})

module.exports = router;
