let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken');
const { json } = require('express');

let userSchema = new Schema({
    name: String,
    age: Number,
    email: String,
    password: String,
    bookId: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    cart: [{ type: Schema.Types.ObjectId, ref: 'Book' }]
})

userSchema.pre('save', async function (next) {
    try {
        if (this.password || this.isModified('password')) {
            let hashed = await bcrypt.hash(this.password, 10)
            this.password = hashed
            return next()
        }
        next()
    } catch (error) {
        console.log(error)
    }
})

userSchema.methods.varifyPassword = async function (password) {
    try {
        let result = await bcrypt.compare(password, this.password)
        return result
    } catch (error) {
        console.log(error)
    }

}


userSchema.methods.signToken = async function () {
    let payload = {
        userId: this.id,
        email: this.email
    }

    try {
        let token = jwt.sign(payload, process.env.PRIVATE_KEY)
        return token
    } catch (error) {
        console.log(error);
    }

}

userSchema.methods.userJSON = function (token) {
    return {
        name: this.name,
        email: this.email,
        id: this.id,
        token: token
    }
}

module.exports = mongoose.model('User', userSchema)