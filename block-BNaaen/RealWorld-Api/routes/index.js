var express = require('express');
var router = express.Router();
var Article = require('../model/Article')
var auth = require('../middleware/auth')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

//get tag
router.get('/tags', async (req, res, next) => {
  let article = await Article.find({})
  let ar = []
  article.forEach((elm) => ar.push(elm.taglist))
  res.json({ tags: ar.flat() })
})

module.exports = router;
