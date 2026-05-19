const User = require('../models/User');
const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const UserService = require('./UserService');

const EXP_PER_CHECKIN = 10;
const COINS_PER_CHECKIN = 5;
const EXP_PER_LEVEL = 100;
const COINS_DAILY_LOGIN = 10;
const STREAK_BONUS_COINS = 3;

/**
 * 增加经验值
 */
const addExp = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }

  const newExp = user.exp + amount;
  const { level: newLevel } = UserService.calculateLevel(newExp);
  const leveledUp = newLevel > user.level;

  user.exp = newExp;
  user.level = newLevel;
  await user.save();

  return { newExp, newLevel, leveledUp };
};

/**
 * 增加金币
 */
const addCoins = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }

  user.coins += amount;
  await user.save();

  return { newCoins: user.coins };
};

/**
 * 获取游戏状态概览
 */
const getGameStatus = async (userId) => {
  const user = await User.findById(userId).select('level exp coins streak totalCheckins');
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }

  const { expToNext, expProgress } = UserService.calculateLevel(user.exp);

  const totalAchievements = await Achievement.countDocuments();
  const unlockedCount = await UserAchievement.countDocuments({ userId });

  const recentAchievements = await UserAchievement.find({ userId })
    .populate('achievementId', 'name icon')
    .sort({ unlockedAt: -1 })
    .limit(3);

  return {
    level: user.level,
    exp: user.exp,
    expToNext,
    expProgress,
    coins: user.coins,
    streak: user.streak,
    totalCheckins: user.totalCheckins,
    unlockedCount,
    totalAchievements,
    recentAchievements: recentAchievements.map(ua => ({
      name: ua.achievementId.name,
      icon: ua.achievementId.icon,
      unlockedAt: ua.unlockedAt.toISOString().split('T')[0]
    }))
  };
};

/**
 * 获取成就列表（含解锁状态和进度）
 */
const getAllAchievements = async (userId) => {
  const user = await User.findById(userId).select('streak totalCheckins coins level');
  const allAchievements = await Achievement.find();
  const userAchievements = await UserAchievement.find({ userId });

  const unlockedMap = {};
  userAchievements.forEach(ua => {
    unlockedMap[ua.achievementId.toString()] = ua;
  });

  return allAchievements.map(ach => {
    const unlocked = !!unlockedMap[ach._id.toString()];
    let progress = 0;
    let target = ach.condition.value || 0;

    // 计算当前进度
    switch (ach.condition.type) {
      case 'totalCheckins':
        progress = user.totalCheckins;
        target = ach.condition.value;
        break;
      case 'streak':
        progress = user.streak;
        target = ach.condition.value;
        break;
      case 'level':
        progress = user.level;
        target = ach.condition.value;
        break;
      case 'coins':
        progress = user.coins;
        target = ach.condition.value;
        break;
      case 'habits':
        // habits 条件使用 totalCheckins 作为替代判定
        progress = user.totalCheckins;
        target = ach.condition.value;
        break;
    }

    return {
      achievementId: ach._id,
      key: ach.key,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      unlocked,
      unlockedAt: unlocked ? unlockedMap[ach._id.toString()].unlockedAt : null,
      progress: unlocked ? target : Math.min(progress, target),
      target
    };
  });
};

/**
 * 检测并解锁成就
 */
const checkAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { newUnlocks: [] };

  const allAchievements = await Achievement.find();
  const unlockedIds = await UserAchievement.find({ userId }).distinct('achievementId');
  const newUnlocks = [];

  for (const ach of allAchievements) {
    // 跳过已解锁的成就
    if (unlockedIds.some(id => id.toString() === ach._id.toString())) continue;

    let satisfied = false;
    switch (ach.condition.type) {
      case 'totalCheckins':
        satisfied = user.totalCheckins >= ach.condition.value;
        break;
      case 'streak':
        satisfied = user.streak >= ach.condition.value;
        break;
      case 'level':
        satisfied = user.level >= ach.condition.value;
        break;
      case 'coins':
        satisfied = user.coins >= ach.condition.value;
        break;
      case 'habits':
        satisfied = user.totalCheckins >= ach.condition.value;
        break;
    }

    if (satisfied) {
      await UserAchievement.create({ userId, achievementId: ach._id });
      // 发放成就奖励
      if (ach.reward.exp > 0) await addExp(userId, ach.reward.exp);
      if (ach.reward.coins > 0) await addCoins(userId, ach.reward.coins);
      newUnlocks.push({
        key: ach.key,
        name: ach.name,
        description: ach.description,
        icon: ach.icon,
        reward: ach.reward
      });
    }
  }

  return { newUnlocks };
};

/**
 * 领取每日登录奖励
 */
const claimDailyLogin = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const user = await User.findById(userId);

  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }

  if (user.lastLoginDate === today) {
    return { coins: 0, claimed: false, message: '今日已领取' };
  }

  user.coins += COINS_DAILY_LOGIN;
  user.lastLoginDate = today;
  await user.save();

  return { coins: COINS_DAILY_LOGIN, claimed: true };
};

module.exports = {
  addExp,
  addCoins,
  getGameStatus,
  getAllAchievements,
  checkAchievements,
  claimDailyLogin
};
