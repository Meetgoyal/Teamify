const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    workspaceId : {
        type : String,
        required : true
    },
    chatName : {
        type : String,
        required : true
    },
    isGroupChat : {
        type : Boolean,
        default : false
    },
    users : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "googleUser"
    }]
},({timestamps : true}));
const chat = mongoose.model('chat',chatSchema)
module.exports = chat;