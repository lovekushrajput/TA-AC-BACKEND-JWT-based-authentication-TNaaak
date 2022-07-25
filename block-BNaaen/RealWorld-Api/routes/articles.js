let express = require('express')
let router = express.Router()
let Article = require('../model/Article')
let User = require('../model/User')
let slag = require('slug')
let Comment = require('../model/Comment')
let auth = require('../middleware/auth')


//list article
router.get('/', async (req, res, next) => {
    let { taglist, author, favorited, limit, offset } = req.query


    if (taglist) {
        let articles = await Article.find({ taglist: taglist })
        return res.json({ articles, articlesCount: articles.length })
    }

    if (author) {
        let r = await User.find({ username: req.query.author })
        let usrid = r[0]._id
        let articles = await Article.find({ author: usrid })
        return res.json({ articles, articlesCount: articles.length })
    }

    if (favorited) {
        let r = await User.find({ username: favorited })
        let usrid = r[0]._id
        let articles = await Article.find({ favorite: usrid })
        return res.json({ articles, articlesCount: articles.length })
    }

    if (limit) {
        let articles = await Article.find({}).limit(limit)
        return res.json({ articles, articlesCount: articles.length })
    }

    if (offset) {
        let articles = await Article.find({}).skip(offset)
        return res.json({ articles, articlesCount: articles.length })
    }

    let articles = await Article.find({})
    return res.json({ articles, articlesCount: articles.length })
})

router.use(auth.varifyToken)


//feed article 
router.get('/feed', async (req, res, next) => {
    let { limit, offset } = req.query
    if (limit) {
        let articles = await Article.find({}).limit(limit)
        return res.json({ articles, articlesCount: articles.length })
    }

    if (offset) {
        let articles = await Article.find({}).skip(offset)
        return res.json({ articles, articlesCount: articles.length })
    }
})

//get article
router.get('/:slug', async (req, res, next) => {
    let slug = req.params.slug
    let article = await Article.findOne({ slug }).populate('author', 'username bio image following')
    res.json(article)
})


//crate article
router.post('/', async (req, res, next) => {
    let loggedInUser = req.users.userId

    try {
        req.body.author = req.users.userId
        req.body.taglist = req.body.taglist.split(',')
        let data = await Article.create(req.body)
        let article = await data.populate('author', 'username bio image following follow')
        if (article.author.follow.includes(loggedInUser)) {
            article.author.following = true
            let user = await User.findByIdAndUpdate(req.users.userId, { $push: { article: article._id } }, { new: true })
            return res.json({ article })
        }
        let user = await User.findByIdAndUpdate(req.users.userId, { $push: { article: article._id } }, { new: true })
        return res.json({ article })
    } catch (error) {
        next(error)
    }
})




//update articles
router.put('/:slug', async (req, res, next) => {
    let slug = req.params.slug
    if (req.body.title) {
        req.body.slug = slag(req.body.title, '-')
    }
    let article = await Article.findOneAndUpdate(slug, req.body, { new: true })
    res.json({ article })
})

//delete article
router.delete('/:slug', async (req, res, next) => {
    let slug = req.params.slug
    let article = await Article.findOneAndDelete({ slug: slug })
    let user = await User.findByIdAndUpdate(req.users.userId, { $pull: { article: article._id } }, { new: true })
    let comment = await Comment.deleteMany({ articleId: article._id })
    res.json({ article })
})


// create comment
router.post('/:slug/comments', async (req, res, next) => {
    let slug = req.params.slug
    let loggedInUser = req.users.userId

    let artcle = await Article.findOne({ slug: slug })
    let user = await User.findById(loggedInUser)
    req.body.author = {
        _id: user._id,
        username: user.username,
        bio: user.bio,
        image: user.image,
        following: user.following
    }
    req.body.articleId = artcle._id
    let comment = await Comment.create(req.body)
    let article = await Article.findOneAndUpdate({ slug: slug }, { $push: { commentId: comment._id } })
    res.json(comment)
})


//get comment
router.get('/:slug/comments', async (req, res, next) => {
    let slug = req.params.slug
    let article = await Article.findOne({ slug: slug })
    let comment = await Comment.find({ articleId: article._id })
    res.json({ comment })
})

//delete comment
router.delete('/:slug/comments/:id', async (req, res, next) => {
    let id = req.params.id
    let comment = await Comment.findByIdAndDelete(id)
    let slug = req.params.slug
    let article = await Article.findOneAndUpdate({ slug: slug }, { $pull: { commentId: comment._id } })
    res.json(comment)
})

// favorite
router.post('/:slug/favorite', async (req, res, next) => {
    let slug = req.params.slug
    let loggedInUser = req.users.userId
    let ar = await Article.findOne({ slug: slug })

    //checking if already favorite then remove 
    if (ar.favorite.includes(loggedInUser)) {
        let article = await Article.findOneAndUpdate({ slug: slug }, { $pull: { favorite: loggedInUser } }, { new: true })
        article.favorited = false
        article.favoritesCount = article.favorite.length
        let user = await User.findByIdAndUpdate(article.author, { $pull: { favorite: article._id } })
        article.save()
        res.json(article)
    } else {
        // if not present then add to favorite
        let article = await Article.findOneAndUpdate({ slug: slug }, { $push: { favorite: loggedInUser } }, { new: true })
        article.favorited = true
        article.favoritesCount = article.favorite.length
        let user = await User.findByIdAndUpdate(article.author, { $push: { favorite: article._id } })
        article.save()

        res.json(article)
    }
})

//unfavorite
router.delete('/:slug/favorite', async (req, res, next) => {
    let slug = req.params.slug
    let loggedInUser = req.users.userId
    let article = await Article.findOneAndUpdate({ slug: slug }, { $pull: { favorite: loggedInUser } }, { new: true })
    article.favorited = false
    article.favoritesCount = article.favorite.length
    let user = await User.findByIdAndUpdate(article.author, { $pull: { favorite: article._id } })
    article.save()
    res.json(article)
})




module.exports = router