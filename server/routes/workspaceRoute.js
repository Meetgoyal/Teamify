const express =  require('express')
const mongoose = require('mongoose')
const Workspace = require('../models/workspaceModel')
const router = express.Router();

router.post('/create', async(req,res)=>{
    const newWorkspace = await Workspace(req.body);
    await newWorkspace.save();
    res.send({
        success : true,
        message : "workspace created!"
    })
})


module.exports = router;