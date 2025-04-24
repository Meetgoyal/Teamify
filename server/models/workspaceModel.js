const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const workspaceSchema = new mongoose.Schema({
    userEmail : {
        type : String,
        required : true
    },
    userImage : {
        type : String
    },
    teamName : {
        type : String,
        required : true
    },
    userName : {
        type : String,
        required : true
    },
    teamMembers : {
        type : [String],
        default : []
    },
    work : {
        type : String,
        required : true
    }
})
module.exports = mongoose.model('workspace',workspaceSchema); 