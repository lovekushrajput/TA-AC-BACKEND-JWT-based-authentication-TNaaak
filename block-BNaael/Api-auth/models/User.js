var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

let userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (this.password && this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

userSchema.methods.varifyPassword = async function (password) {
    try {
        let result = await bcrypt.compare(password, this.password)
        return result
    } catch (error) {
        return error
    }

}

userSchema.methods.signToken = async function () {
    var payload = {
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
        token: token
    }
}


module.exports = mongoose.model('User', userSchema)