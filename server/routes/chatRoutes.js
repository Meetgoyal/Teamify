const express = require('express');
const router = express.Router();
const {accessChat, fetchChat, groupChat} = require('../Controllers/chatControllers')
//router.route("/").post(accessChat);
//router.route("/").get(fetchChat);
router.route("/group").post(groupChat);
module.exports = router;