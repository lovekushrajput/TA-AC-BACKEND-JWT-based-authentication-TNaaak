var express = require('express');
var router = express.Router();
var User = require('../model/User')
var auth = require('../middleware/auth');


//register
router.post('/', async (req, res, next) => {
  try {
    let user = await User.create(req.body)
    let token = await user.signToken()
    res.json({ user: user.userJSON(token) })
  } catch (error) {
    next(error)
  }

})

//login
router.post('/login', async (req, res, next) => {
  let { email, password } = req.body
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email/password is required' })
    }
    let user = await User.findOne({ email })

    //no email
    if (!user) {
      return res.status(400).json({ error: 'Invalid Email' })
    }

    let result = await user.varifyPassword(password)

    //no password
    if (!result) {
      return res.status(400).json({ error: 'Wrong Password' })
    }

    //generate token
    let token = await user.signToken()
    res.json({ user: user.userJSON(token) })

  } catch (error) {
    next(error)
  }
})

//Authentication
router.use(auth.varifyToken)

//current user
router.get('/', async function (req, res, next) {
  try {
    let user = await User.findById(req.users.userId)
    res.json({ user })
  } catch (error) {
    next(error)
  }
});

//update user
router.put('/', async (req, res, next) => {
  try {
    let user = await User.findByIdAndUpdate(req.users.userId, req.body, { new: true })
    res.json({ user })
  } catch (error) {
    next(error)
  }

})


module.exports = router;
