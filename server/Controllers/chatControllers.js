const asyncHandler = require('express-async-handler');
const chat = require('../models/ChatModel');
const googleUser = require('../models/GoogleUserModel');

const accessChat = asyncHandler(async(req,res)=>{
    const userId  = req.body.userId;
    if(!userId){
        console.log('userId parmas not send');
        return res.sendStatus(404);
    }
    var isChat = await chat.find({
        isGroupChat: false,
        $and : [
            {users:{$elemMatch:{$eq: userId}}}
        ]
    }).populate("users","-password");
    if(isChat.length > 0){
        res.send(isChat[0]);
    }
    else{
        var chatData = {
            workspaceId : req.body.workspaceId,
            chatName : req.body.name,
            isGroupChat : false,
            users : [userId]
        };
        try {
            const createdChat = await chat.create(chatData);
            const FullChat = await chat.findOne({_id : createdChat._id}).populate("users","-password");
            res.status(200).send(FullChat);

        } catch (error) {
            console.log(error);
        }
    }
});

const fetchChat = asyncHandler (async(req,res) => {
        try {
            const chats = chat.find({users:{$elemMatch:{$eq:req.query.userId}}}).then(result => res.send(result));
        } catch (error) {
            console.log(error);
        }
});

const groupChat = asyncHandler(async(req,res) => {
    if(!req.body.users || !req.body.name){
        return res.status(400).send({
            message: "please fill!!"
        });
    };
    var users = JSON.parse(req.body.users);
    if(users.length < 2){
        return res.status(400).send({
            message : "more than 2 users"
        })
    }

    users = await googleUser.find({ email: { $in: users } }).select("_id");
    try {
        const newchat = {
            workspaceId : req.body.workspaceId,
            chatName : req.body.name,
            isGroupChat: true,
            users: users
        };
        var groupChat1 = await chat.findOne({workspaceId : newchat.workspaceId});
        if(!groupChat1){
            groupChat1 = await chat.create(newchat);
        } 
        const FullGroupChat = await chat.findOne({_id : groupChat1._id}).populate("users","-password");
        res.status(200).send(FullGroupChat);
    } catch (error) {
        console.log(error);
    }
})

module.exports = { accessChat , fetchChat , groupChat };