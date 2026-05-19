const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GameController = require('../controllers/GameController');

router.get('/status', auth, GameController.getGameStatus);
router.get('/achievements', auth, GameController.getAchievements);
router.post('/daily-login', auth, GameController.claimDailyLogin);

module.exports = router;
