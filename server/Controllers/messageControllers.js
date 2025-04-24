const asyncHandler = require('express-async-handler');
const Message = require('../models/MessageModel');
const googleUser = require('../models/GoogleUserModel');

const sendMessage = asyncHandler(async(req,res) => {
    const {content , chatId} = req.body;
    
    if(!content || !chatId){
        return res.sendStatus(400);
    }
    var newMessage = {
        sender: req.body._id,
        content: content,
        chat: chatId
    };
    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender","Name email Image");
        message = await message.populate("chat");
        message = await googleUser.populate(message,{
            path:'chat.users'
        })
        res.json(message);
    } catch (error) {
        console.log(error);
    }
})

const fetchMessage = asyncHandler(async(req,res) => {
    try {
        const messages = await Message.find({ chat:req.params.chatId }).populate(
            "sender","Name Image email"
        ).populate("chat");
        res.json(messages);
    } catch (error) {
        console.log(error);
    }
})
module.exports = {sendMessage , fetchMessage };