let mongoose = require('mongoose')
let Schema = mongoose.Schema

let bookSchema = new Schema({
    title: String,
    summary: String,
    pages: Number,
    publication: String,
    price: Number,
    quantity: { type: Number, default: 0 },
    category: [String],
    commentId: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    // categoryId: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    userId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })


module.exports = mongoose.model('Book', bookSchema)