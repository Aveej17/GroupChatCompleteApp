const express = require('express');
const router = express.Router();

const Controller = require('../controller/userController'); 


router.post('/signup', Controller.createUser);
router.post('/login', Controller.loginUser);
router.get('/check',  Controller.check);


module.exports= router;