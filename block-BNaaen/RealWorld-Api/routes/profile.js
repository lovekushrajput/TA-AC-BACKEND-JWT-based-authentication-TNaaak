var express = require('express');
var router = express.Router();
var User = require('../model/User')
var auth = require('../middleware/auth');


//get profile
router.get('/:username', auth.optionalAuthentication, async (req, res, next) => {
    let username = req.params.username

    let profile = await User.findOne({ username }, 'username bio image following')

    //if user is login
    if (req.users) {
        let loggedInUser = await User.findById(req.users.userId)
        //if loggedInUser follow the username
        if (loggedInUser.follow.includes(profile._id)) {
            //return following as true
            profile.following = true
            return res.json({ profile })
        } else {
            return res.json({ json })
        }

        //if users is not logged In
    } else {
        res.json({ profile })
    }
})


router.use(auth.varifyToken)

//follow
router.post('/:username/follow', async (req, res, next) => {
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
        let usr = await User.findOneAndUpdate({ username }, { $push: { follow: loggedInUser } }, { new: true })
        usr.following = true

        let profile = {
            username: usr.username,
            bio: usr.bio,
            image: usr.image,
            following: usr.following
        }
        res.json({ profile })
    } catch (error) {
        next(error)
    }
})


//unfollow
router.delete('/:username/follow', async (req, res, next) => {
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
            let usr = await User.findOneAndUpdate({ username }, { $pull: { follow: loggedInUser } }, { new: true })
            usr.following = false

            let profile = {
                name: usr.name,
                username: usr.username,
                email: usr.email,
                bio: usr.bio,
                following: usr.following
            }
            return res.json({ profile })
        }

        return res.json({ error: `You Have already unfollowed ${username}` })

    } catch (error) {
        next(error)
    }
})

module.exports = router