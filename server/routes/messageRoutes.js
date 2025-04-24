const express = require('express');
const router = express.Router();
const {sendMessage , fetchMessage}  = require('../Controllers/messageControllers');
router.route('/').post(sendMessage);
router.route('/:chatId').get(fetchMessage);

module.exports = router;
