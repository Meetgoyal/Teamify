const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const GoogleSchema = new mongoose.Schema({
    GoogleId : String,
    Name : String,
    email : String,
    Image : String,
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},({timestamps : true}));

GoogleSchema.methods.generateAuthToken = async function () {
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
const googleUser = mongoose.model("googleUser", GoogleSchema);
module.exports = googleUser;



