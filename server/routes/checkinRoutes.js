const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CheckinController = require('../controllers/CheckinController');

// 打卡相关
router.post('/checkins', auth, CheckinController.checkin);
router.get('/checkins/today', auth, CheckinController.getTodayStatus);
router.get('/checkins/history', auth, CheckinController.getHistory);

// 习惯相关
router.get('/habits', auth, CheckinController.getUserHabits);
router.post('/habits', auth, CheckinController.createHabit);
router.put('/habits/:habitId', auth, CheckinController.updateHabit);
router.delete('/habits/:habitId', auth, CheckinController.archiveHabit);

module.exports = router;
