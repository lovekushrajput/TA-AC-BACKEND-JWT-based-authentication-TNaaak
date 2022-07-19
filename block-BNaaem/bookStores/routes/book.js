var express = require('express');
var router = express.Router();
var Book = require('../models/Book')
var User = require('../models/User')
var Comment = require('../models/Comment')


/* GET books listing. */
router.get('/', function (req, res, next) {
  Book.find({}, (err, Books) => {
    if (err) return next(err)
    res.json({ Books })
  })
});


//book details
router.get('/:id', (req, res, next) => {
  let id = req.params.id
  Book.findById(id).populate('commentId').exec((err, book) => {
    if (err) return next(err)
    res.json({ book })
  })
})

//Edit book
router.put('/:id/edit', (req, res) => {
  let id = req.params.id
  Book.findByIdAndUpdate(id, req.body, (err, book) => {
    if (err) return next(err)
    res.redirect('/api/Books/' + id)
  })
})

//create comment
router.post('/:id/comment', (req, res) => {
  let bookId = req.params.id
  req.body.bookId = bookId
  Comment.create(req.body, (err, comments) => {
    if (err) return next(err)
    Book.findByIdAndUpdate(comments.bookId, { $push: { commentId: comments._id } }, (err, book) => {
      if (err) return next(err)
      res.redirect('/api/Books/' + bookId)
    })
  })
})

// delete book
router.delete('/:id/delete', async (req, res) => {
  let id = req.params.id
  let book = await Book.findByIdAndDelete(id)
  let comment = await Comment.deleteMany({ bookId: book._id })
  let userCart = await User.deleteMany({ cart: book._id })
  let user = await User.deleteMany({ bookId: book._id })
  res.redirect('/api/Books')
})


//added to cartt
router.put('/:id/cart', async (req, res, next) => {
  let id = req.params.id
  try {
    let book = await Book.findById(id)
    let user = await User.findByIdAndUpdate(book.userId, { $push: { cart: book._id } })
    res.json({ message: 'book added to cart successfully', user })
  } catch (error) {
    next(error)
  }
})

router.put('/:id/deleteCart', async (req, res) => {
  let id = req.params.id
  try {
    let book = await Book.findById(id)
    let user = await User.findByIdAndUpdate(book.userId, { $pull: { cart: book._id } })
    res.json({ message: 'book removed from cart successfully', user })
  } catch (error) {
    next(error)
  }
})



module.exports = router;
