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

//profile
router.get('/profiles/:username', async (req, res, next) => {
  let username = req.params.username

  let user = await User.findOne({ username })

  let profile = {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: user.following
  }

  res.json({ profile })
})


//follow
router.post('/profiles/:username/follow', async (req, res, next) => {
  let username = req.params.username
  let loggedInUser = req.users.userId

  try {
    let followedUser = await User.findOne({ username })

    //no followed user
    if (!followedUser) {
      return res.status(400).json({ error: `${username} is not found` })
    }

    // checking loggedInUser and followed user are not same
    if (followedUser._id.equals(loggedInUser)) {
      return res.status(400).json({ error: 'You Can`t follow Yourself' })
    }

    //checking if user is alredy followed or not
    if (followedUser.follow.includes(loggedInUser)) {
      return res.json({ error: `You Have already followed ${username}` })
    }

    //finally followed
    let user = await User.findOneAndUpdate({ username }, { $push: { follow: loggedInUser } })
    user.following = true
    user.save()

    res.redirect('/api/users/profiles/' + username)
  } catch (error) {
    next(error)
  }
})


//unfollow
router.delete('/profiles/:username/follow', async (req, res, next) => {
  let username = req.params.username
  let loggedInUser = req.users.userId

  try {
    let unfollowedUser = await User.findOne({ username })

    // //no followed user
    if (!unfollowedUser) {
      return res.status(400).json({ error: `${username} is not found` })
    }
    //checking loggedInUser and followed user are not same
    if (unfollowedUser._id.equals(loggedInUser)) {
      return res.status(400).json({ error: 'You Can`t unfollow Yourself' })
    }




    //checking if user is alredy followed or not
    if (unfollowedUser.follow.includes(loggedInUser)) {
      //finally unfollowed
      let user = await User.findOneAndUpdate({ username }, { $pull: { follow: loggedInUser } })
      user.following = false
      user.save()
      return res.redirect('/api/users/profiles/' + username)
    }
    return res.json({ error: `You Have already unfollowed ${username}` })
  } catch (error) {
    next(error)
  }
})

module.exports = router;
