const mongoose = require('mongoose')
const express = require('express')
const User = require('../models/UserModel')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
router.post('/register', async (req, res) => {
    try {
        const isExists = await User.findOne({ email: req.body.email });
        if (isExists) {
            res.send({
                success: false,
                message: "user Already Exists"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;
        const newUser = await User(req.body)
        await newUser.save();
        res.send({
            success: true,
            message: "user registred"
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.send({
                success: false,
                message: "user not registered!",
                login: false

            })
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.send({
                success: false,
                message: "Invalid Password",
                login: false
            })
        }
        const token = await user.generateAuthToken();
        res.cookie("jswtoken",token,
            {
            path : '/',
            expires : new Date(Date.now() + 25892000000)
        })
        res.send({
            success: true,
            message: "user logined!",
            login: true
        })
    } catch (error) {
        console.log(error)
    }

})


router.post('/getEmail',async (req, res) => {
    try {
        const user = await User.findOne({"tokens.token" : req.body.token});
        res.send({
            success : true,
            message : "user found",
            email : user.email
        })
    } catch (error) {
        console.log(error);
    }

  });
module.exports = router;