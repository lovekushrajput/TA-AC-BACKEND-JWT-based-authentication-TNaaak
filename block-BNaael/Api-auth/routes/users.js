var express = require('express');
var router = express.Router();
var User = require('../models/User')
var auth = require('../middlewares/auth')


/* GET users listing. */
router.get('/', auth.varifyToken, function (req, res, next) {
  res.send('respond with a resource');
});

//register
router.post('/register', async (req, res, next) => {
  try {
    let user = await User.create(req.body)
    let token = await user.signToken()
    res.status(201).json({ user: user.userJSON(token) })
  } catch (error) {
    next(error)
  }
})

//login
router.post('/login', async (req, res, next) => {
  let { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email/Password is required' })
  }
  try {
    let user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: 'Invalid Email' })
    }

    let result = await user.varifyPassword(password)

    if (!result) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    //generate token
    let token = await user.signToken()
    res.json({ user: user.userJSON(token) })

  } catch (error) {
    next(error)
  }

})

module.exports = router;
