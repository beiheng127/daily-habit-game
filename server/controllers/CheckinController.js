const CheckinService = require('../services/CheckinService');

const checkin = async (req, res, next) => {
  try {
    const { habitId, note } = req.body;
    const result = await CheckinService.checkin(req.userId, habitId, note);
    res.json({ code: 200, message: '打卡成功', data: result });
  } catch (err) {
    next(err);
  }
};

const getTodayStatus = async (req, res, next) => {
  try {
    const date = req.query.date;
    const result = await CheckinService.getTodayStatus(req.userId, date);
    res.json({ code: 200, data: result });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, habitId } = req.query;
    const result = await CheckinService.getHistory(req.userId, startDate, endDate, habitId);
    res.json({ code: 200, data: result });
  } catch (err) {
    next(err);
  }
};

const createHabit = async (req, res, next) => {
  try {
    const habit = await CheckinService.createHabit(req.userId, req.body);
    res.json({ code: 200, message: '习惯创建成功', data: habit });
  } catch (err) {
    next(err);
  }
};

const updateHabit = async (req, res, next) => {
  try {
    const habit = await CheckinService.updateHabit(req.userId, req.params.habitId, req.body);
    res.json({ code: 200, message: '习惯更新成功', data: habit });
  } catch (err) {
    next(err);
  }
};

const archiveHabit = async (req, res, next) => {
  try {
    const result = await CheckinService.archiveHabit(req.userId, req.params.habitId);
    res.json({ code: 200, message: result.message, data: result.habit });
  } catch (err) {
    next(err);
  }
};

const getUserHabits = async (req, res, next) => {
  try {
    const habits = await CheckinService.getUserHabits(req.userId);
    res.json({ code: 200, data: habits });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkin, getTodayStatus, getHistory, createHabit, updateHabit, archiveHabit, getUserHabits };
