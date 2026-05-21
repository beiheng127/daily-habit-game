/**
 * DailyHabit 用户模块路由
 * 作者：李亚恒
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserController = require('../controllers/UserController');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', auth, UserController.getProfile);
router.put('/profile', auth, UserController.updateProfile);
router.put('/password', auth, UserController.changePassword);
router.get('/:userId/level', auth, UserController.getLevelInfo);

module.exports = router;
