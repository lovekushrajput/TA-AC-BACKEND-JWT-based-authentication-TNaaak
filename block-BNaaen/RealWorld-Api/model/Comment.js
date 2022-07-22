let mongoose = require('mongoose')
let Schema = mongoose.Schema

let commetSchema = new Schema({
    body: { type: String },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' }
})

module.exports = mongoose.model('Comment', commetSchema)