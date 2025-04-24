const jwt = require('jsonwebtoken');
const User = require('../models/UserModel')
const Authenticate = async(req,res,next)=>{
    try {
        const token = req.cookies.jswtoken;
        const verifyToken = jwt.verify(token,"MYNAMEISMEETGOYALQWERTYUIOPLKJHGFDSAMNBVCXZ");
        console.log(verifyToken);
        const user = await User.findOne({_id:verifyToken._id,"tokens.token" : token});
        if(!user){
            {throw new Error("user not found")}
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        
        res.status(401).send("unauthorized")
    }
}
module.exports = Authenticate;