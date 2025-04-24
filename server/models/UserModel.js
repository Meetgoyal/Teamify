const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, ({ timestamps: true }));
UserSchema.methods.generateAuthToken = async function () {
    try {
        const secret_key = "MYNAMEISMEETGOYALQWERTYUIOPLKJHGFDSAMNBVCXZ";
        let token = jwt.sign({ _id: this._id }, secret_key);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error)
    }
}
module.exports = mongoose.model('users', UserSchema);