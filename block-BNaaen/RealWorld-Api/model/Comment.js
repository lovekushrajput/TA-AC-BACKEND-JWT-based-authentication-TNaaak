let mongoose = require('mongoose')
let Schema = mongoose.Schema

let commetSchema = new Schema({
    body: { type: String },
    author: {
        _id: { type: Schema.Types.ObjectId, ref: 'User' },
        username: String,
        bio: String,
        image: String,
        following: { type: Boolean, default: false }
    },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' }
}, { timestamps: true })

module.exports = mongoose.model('Comment', commetSchema)