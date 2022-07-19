let mongoose = require('mongoose')
let Schema = mongoose.Schema

let commentSchema = new Schema({
    bookId: { type: Schema.Types.ObjectId, ref: 'Book' },
    title: String
}, { timestamps: true })


module.exports = mongoose.model('Comment', commentSchema)