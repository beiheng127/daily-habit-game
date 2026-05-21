/**
 * DailyHabit 打卡系统模块
 * 作者：朱其浩（技术负责人）
 * 负责：打卡记录/习惯CRUD/连续天数计算
 */

const Checkin = require('../models/Checkin');
const Habit = require('../models/Habit');
const User = require('../models/User');
const GameService = require('./GameService');

/**
 * 获取今日日期字符串（东八区 YYYY-MM-DD）
 */
const getTodayStr = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offset + 8 * 3600000);
  return local.toISOString().split('T')[0];
};

/**
 * 获取昨天日期字符串
 */
const getYesterdayStr = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const local = new Date(now.getTime() - offset + 8 * 3600000);
  local.setDate(local.getDate() - 1);
  return local.toISOString().split('T')[0];
};

/**
 * 执行打卡
 */
/**
 * 根据连续天数计算打卡经验和金币奖励（阶梯式）
 * 天数越多奖励越高，激励长期坚持
 */
const getStreakBonus = (currentStreak) => {
  if (currentStreak >= 31) return { exp: 30, coins: 15 };
  if (currentStreak >= 15) return { exp: 25, coins: 12 };
  if (currentStreak >= 8)  return { exp: 20, coins: 10 };
  if (currentStreak >= 4)  return { exp: 15, coins: 8 };
  if (currentStreak >= 2)  return { exp: 12, coins: 6 };
  return { exp: 10, coins: 5 };
};

const checkin = async (userId, habitId, note) => {
  const today = getTodayStr();

  // 验证 habit 属于当前用户
  const habit = await Habit.findOne({ _id: habitId, userId });
  if (!habit) {
    throw { status: 404, message: '习惯不存在或不属于当前用户' };
  }

  // 检查今天是否已打卡
  const existing = await Checkin.findOne({ userId, habitId, date: today });
  if (existing) {
    throw { status: 409, message: '今天已打卡' };
  }

  // 创建打卡记录
  const checkinRecord = await Checkin.create({ userId, habitId, date: today, note: note || '' });

  // 计算连续天数
  const yesterday = getYesterdayStr();
  const yesterdayCheckin = await Checkin.findOne({ userId, habitId, date: yesterday });

  if (yesterdayCheckin) {
    habit.currentStreak += 1;
  } else {
    habit.currentStreak = 1;
  }
  await habit.save();

  // 更新用户总打卡数
  const user = await User.findById(userId);
  user.totalCheckins += 1;

  // 更新用户最长连续打卡记录
  if (habit.currentStreak > user.streak) {
    user.streak = habit.currentStreak;
  }
  await user.save();

  // 发放打卡奖励（根据连续天数阶梯计算）
  const bonus = getStreakBonus(habit.currentStreak);
  const expResult = await GameService.addExp(userId, bonus.exp);
  const coinsResult = await GameService.addCoins(userId, bonus.coins);

  // 检查成就
  const achievementResult = await GameService.checkAchievements(userId);

  return {
    checkinId: checkinRecord._id,
    date: today,
    streak: habit.currentStreak,
    expGained: bonus.exp,
    coinsGained: bonus.coins,
    newExp: expResult.newExp,
    newLevel: expResult.newLevel,
    newAchievements: achievementResult.newUnlocks
  };
};

/**
 * 查询今日打卡状态
 */
const getTodayStatus = async (userId, date) => {
  const targetDate = date || getTodayStr();
  const habits = await Habit.find({ userId, isArchived: false });
  const checkins = await Checkin.find({ userId, date: targetDate });

  const result = habits.map(habit => {
    const checked = checkins.find(c => c.habitId.toString() === habit._id.toString());
    return {
      habitId: habit._id,
      habitName: habit.name,
      icon: habit.icon,
      color: habit.color,
      checkedIn: !!checked,
      note: checked ? checked.note : null
    };
  });

  return { date: targetDate, checkins: result };
};

/**
 * 查询打卡历史
 */
const getHistory = async (userId, startDate, endDate, habitId) => {
  const today = getTodayStr();
  // 用东八区计算30天前
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const cst = new Date(now.getTime() - offset + 8 * 3600000);
  cst.setDate(cst.getDate() - 30);
  const defaultStart = cst.toISOString().split('T')[0];

  const query = { userId };
  query.date = {
    $gte: startDate || defaultStart,
    $lte: endDate || today
  };
  if (habitId) query.habitId = habitId;

  const checkins = await Checkin.find(query)
    .populate('habitId', 'name icon')
    .sort({ date: -1 });

  const mapped = checkins.map(c => ({
    date: c.date,
    habitName: c.habitId ? c.habitId.name : '已删除的习惯',
    habitIcon: c.habitId ? c.habitId.icon : '❓',
    note: c.note
  }));

  return { total: mapped.length, checkins: mapped };
};

/**
 * 创建习惯
 */
const createHabit = async (userId, data) => {
  const habit = await Habit.create({ ...data, userId });
  return habit;
};

/**
 * 编辑习惯
 */
const updateHabit = async (userId, habitId, updates) => {
  const habit = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    updates,
    { new: true }
  );
  if (!habit) {
    throw { status: 404, message: '习惯不存在' };
  }
  return habit;
};

/**
 * 归档习惯（软删除）
 */
const archiveHabit = async (userId, habitId) => {
  const habit = await Habit.findOneAndUpdate(
    { _id: habitId, userId },
    { isArchived: true },
    { new: true }
  );
  if (!habit) {
    throw { status: 404, message: '习惯不存在' };
  }
  return { message: '习惯已归档', habit };
};

/**
 * 获取用户所有活跃习惯
 */
const getUserHabits = async (userId) => {
  const habits = await Habit.find({ userId, isArchived: false }).sort({ createdAt: -1 });
  return habits;
};

module.exports = {
  checkin,
  getTodayStatus,
  getHistory,
  createHabit,
  updateHabit,
  archiveHabit,
  getUserHabits
};
