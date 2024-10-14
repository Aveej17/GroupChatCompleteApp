const express = require('express');
const router = express.Router();

const auth= require('../middleware/auth');
const groupController = require('../controller/groupController');



router.get('/get/:groupId', auth.authentication, groupController.getGroup);
router.post('/:groupId/users', auth.authentication, auth.isAdmin, groupController.addUser);
router.get('/:groupId/users', auth.authentication, groupController.getUsers);
router.get('/get', auth.authentication, groupController.getGroups);
router.post('/create', auth.authentication,  groupController.createGroup);
router.delete('/:groupId/users/:userId', auth.authentication, auth.isAdmin, groupController.removeUser);
router.patch('/:groupId/users/:userId/role', auth.authentication, auth.isAdmin, groupController.updateUserRole);

module.exports = router;