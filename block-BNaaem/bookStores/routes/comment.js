var express = require('express');
var router = express.Router();
var Comment = require('../models/Comment')
var Book = require('../models/Book')




//edit comment
router.put('/:id/edit', (req, res, next) => {
    Comment.findByIdAndUpdate(req.params.id, req.body, (err, comment) => {
        if (err) return next(err)
        res.redirect('/api/Books/' + comment.bookId)
    })
})

//delete
router.delete('/:id/delete', (req, res, next) => {
    Comment.findByIdAndDelete(req.params.id, (err, comment) => {
        if (err) return next(err)
        Book.findByIdAndUpdate(comment.bookId, { $pull: { commentId: comment._id } }, (err, book) => {
            if (err) return next(err)
            res.redirect('/api/Books/' + comment.bookId)
        })
    })
})



module.exports = router;