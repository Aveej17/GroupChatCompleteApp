const express = require('express');
const router = express.Router();

const auth= require('../middleware/auth');
const chatController = require('../controller/chatController');

router.get('/getAll/:groupId',auth.authentication, chatController.getChat);
router.get('/getNew', auth.authentication, chatController.getNewMessages);
router.post('/create', auth.authentication, chatController.createChat);

module.exports = router;