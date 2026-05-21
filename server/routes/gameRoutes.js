/**
 * DailyHabit 游戏化模块路由
 * 作者：张嵩林
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GameController = require('../controllers/GameController');

router.get('/status', auth, GameController.getGameStatus);
router.get('/achievements', auth, GameController.getAchievements);
router.post('/daily-login', auth, GameController.claimDailyLogin);
router.get('/shop', auth, GameController.getShopItems);
router.post('/shop/buy', auth, GameController.buyItem);
router.post('/shop/use', auth, GameController.useItem);
router.get('/leaderboard', auth, GameController.getLeaderboard);

module.exports = router;
