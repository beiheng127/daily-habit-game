/**
 * DailyHabit 游戏化系统模块
 * 作者：张嵩林（开发/测试）
 * 负责：经验值/等级/金币/成就系统
 */

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
/**
 * 获取东八区今日日期字符串
 */
const getCSTToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const cst = new Date(now.getTime() - offset + 8 * 3600000);
  return cst.toISOString().split('T')[0];
};

const claimDailyLogin = async (userId) => {
  const today = getCSTToday();
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

const SHOP_ITEMS = [
  { id: 'skip_card', name: '补签卡', description: '补签一次已错过的打卡', icon: '⏪', price: 30, type: 'skipCards' },
  { id: 'rename_card', name: '改名卡', description: '修改一次昵称', icon: '✏️', price: 50, type: 'renameCards' },
  { id: 'avatar_frame_gold', name: '金色头像框', description: '尊贵金框彰显身份', icon: '🖼️', price: 100, type: 'avatarFrames', value: 'gold' },
  { id: 'theme_purple', name: '紫色主题', description: '深邃紫韵主题色', icon: '🎨', price: 80, type: 'themeColors', value: 'purple' },
];

const getShopItems = async (userId) => {
  const user = await User.findById(userId).select('coins inventory activeFrame activeTheme');
  if (!user) throw { status: 404, message: '用户不存在' };

  return SHOP_ITEMS.map(item => {
    const owned = item.type === 'avatarFrames'
      ? user.inventory.avatarFrames.includes(item.value)
      : item.type === 'themeColors'
      ? user.inventory.themeColors.includes(item.value)
      : false;

    let equipped = false;
    if (item.type === 'avatarFrames') equipped = user.activeFrame === item.value;
    if (item.type === 'themeColors') equipped = user.activeTheme === item.value;

    return { ...item, owned, equipped };
  });
};

const buyItem = async (userId, itemId) => {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) throw { status: 404, message: '商品不存在' };

  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: '用户不存在' };

  if (user.coins < item.price) throw { status: 400, message: '金币不足' };

  if (item.type === 'avatarFrames') {
    if (user.inventory.avatarFrames.includes(item.value)) {
      throw { status: 400, message: '已拥有该头像框' };
    }
    user.inventory.avatarFrames.push(item.value);
  } else if (item.type === 'themeColors') {
    if (user.inventory.themeColors.includes(item.value)) {
      throw { status: 400, message: '已拥有该主题色' };
    }
    user.inventory.themeColors.push(item.value);
  } else if (item.type === 'skipCards') {
    user.inventory.skipCards += 1;
  } else if (item.type === 'renameCards') {
    user.inventory.renameCards += 1;
  }

  user.coins -= item.price;
  await user.save();

  return { message: `成功购买 ${item.name}！`, newCoins: user.coins, inventory: user.inventory };
};

/**
 * 使用背包物品
 * itemType: 'renameCard' | 'avatarFrame' | 'theme'
 * itemValue: 具体值（头像框名称/主题色名）
 */
const useItem = async (userId, itemType, itemValue) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: '用户不存在' };

  switch (itemType) {
    case 'renameCard': {
      // 使用改名卡：消耗一张，前端传入新昵称 newName
      if (!itemValue) throw { status: 400, message: '请输入新昵称' };
      if (user.inventory.renameCards <= 0) {
        throw { status: 400, message: '没有改名卡' };
      }
      user.inventory.renameCards -= 1;
      user.nickname = itemValue;
      break;
    }
    case 'avatarFrame': {
      // 装备头像框
      if (!user.inventory.avatarFrames.includes(itemValue)) {
        throw { status: 400, message: '未拥有该头像框' };
      }
      user.activeFrame = user.activeFrame === itemValue ? '' : itemValue;
      break;
    }
    case 'theme': {
      // 装备主题色
      if (!user.inventory.themeColors.includes(itemValue)) {
        throw { status: 400, message: '未拥有该主题' };
      }
      user.activeTheme = user.activeTheme === itemValue ? '' : itemValue;
      break;
    }
    default:
      throw { status: 400, message: '未知物品类型' };
  }

  await user.save();
  return {
    message: itemType === 'renameCard' ? '昵称修改成功' : '装备切换成功',
    activeFrame: user.activeFrame,
    activeTheme: user.activeTheme,
    nickname: user.nickname,
    inventory: user.inventory
  };
};

const getLeaderboard = async (period = 'all') => {
  let matchStage = {};

  // 周榜/月榜：按打卡记录聚合，统计该时段内打卡次数
  if (period === 'weekly' || period === 'monthly') {
    const Checkin = require('../models/Checkin');
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const cst = new Date(now.getTime() - offset + 8 * 3600000);
    const todayStr = cst.toISOString().split('T')[0];

    const startDate = new Date(cst);
    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }
    const startStr = startDate.toISOString().split('T')[0];

    // 聚合该时段内每个用户的打卡次数
    const aggregations = await Checkin.aggregate([
      { $match: { date: { $gte: startStr, $lte: todayStr } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // 填充用户信息
    const userIds = aggregations.map(a => a._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username nickname level')
      .lean();

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    return aggregations.map((a, i) => {
      const u = userMap[a._id.toString()];
      return {
        rank: i + 1,
        userId: a._id,
        username: u ? u.username : '未知用户',
        nickname: u ? u.nickname : '未知',
        level: u ? u.level : 1,
        periodCheckins: a.count,
        totalCheckins: 0
      };
    });
  }

  // 全部排行（按等级+总打卡数）
  const users = await User.find({})
    .select('username nickname level totalCheckins')
    .sort({ level: -1, totalCheckins: -1 })
    .limit(20)
    .lean();

  return users.map((u, i) => ({
    rank: i + 1,
    userId: u._id,
    username: u.username,
    nickname: u.nickname,
    level: u.level,
    totalCheckins: u.totalCheckins
  }));
};

module.exports = {
  addExp,
  addCoins,
  getGameStatus,
  getAllAchievements,
  checkAchievements,
  claimDailyLogin,
  getShopItems,
  buyItem,
  useItem,
  getLeaderboard
};
