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

const getCSTToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const cst = new Date(now.getTime() - offset + 8 * 3600000);
  return cst.toISOString().split('T')[0];
};

const getUserById = async (userId, select = '') => {
  const query = User.findById(userId);
  if (select) query.select(select);
  const user = await query;
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }
  return user;
};

const calculateProgress = (user, condition) => {
  const progressMap = {
    totalCheckins: user.totalCheckins,
    streak: user.streak,
    level: user.level,
    coins: user.coins,
    habits: user.totalCheckins
  };
  return progressMap[condition.type] || 0;
};

const addExp = async (userId, amount) => {
  const user = await getUserById(userId);
  const newExp = user.exp + amount;
  const { level: newLevel } = UserService.calculateLevel(newExp);
  const leveledUp = newLevel > user.level;

  user.exp = newExp;
  user.level = newLevel;
  await user.save();

  return { newExp, newLevel, leveledUp };
};

const addCoins = async (userId, amount) => {
  const user = await getUserById(userId);
  user.coins += amount;
  await user.save();
  return { newCoins: user.coins };
};

const getGameStatus = async (userId) => {
  const user = await getUserById(userId, 'level exp coins streak totalCheckins');
  const { expToNext, expProgress } = UserService.calculateLevel(user.exp);

  const [totalAchievements, userAchievements] = await Promise.all([
    Achievement.countDocuments(),
    UserAchievement.find({ userId })
      .populate('achievementId', 'name icon')
      .sort({ unlockedAt: -1 })
      .limit(3)
      .lean()
  ]);

  return {
    level: user.level,
    exp: user.exp,
    expToNext,
    expProgress,
    coins: user.coins,
    streak: user.streak,
    totalCheckins: user.totalCheckins,
    unlockedCount: userAchievements.length,
    totalAchievements,
    recentAchievements: userAchievements.map(ua => ({
      name: ua.achievementId?.name || '',
      icon: ua.achievementId?.icon || '',
      unlockedAt: ua.unlockedAt?.toISOString().split('T')[0] || ''
    }))
  };
};

const getAllAchievements = async (userId) => {
  const user = await getUserById(userId, 'streak totalCheckins coins level');
  const allAchievements = await Achievement.find();
  const userAchievements = await UserAchievement.find({ userId });

  const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId.toString(), ua]));

  return allAchievements.map(ach => {
    const key = ach._id.toString();
    const unlocked = unlockedMap.has(key);
    const target = ach.condition.value || 0;
    const progress = unlocked ? target : Math.min(calculateProgress(user, ach.condition), target);

    return {
      achievementId: ach._id,
      key: ach.key,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      unlocked,
      unlockedAt: unlocked ? unlockedMap.get(key).unlockedAt : null,
      progress,
      target
    };
  });
};

const checkAchievements = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return { newUnlocks: [] };

  const allAchievements = await Achievement.find();
  const unlockedIds = await UserAchievement.find({ userId }).distinct('achievementId');
  const unlockedSet = new Set(unlockedIds.map(id => id.toString()));
  const newUnlocks = [];

  for (const ach of allAchievements) {
    if (unlockedSet.has(ach._id.toString())) continue;

    const satisfied = calculateProgress(user, ach.condition) >= ach.condition.value;

    if (satisfied) {
      await UserAchievement.create({ userId, achievementId: ach._id });
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

const claimDailyLogin = async (userId) => {
  const today = getCSTToday();
  const user = await getUserById(userId);

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
  const user = await getUserById(userId, 'coins inventory activeFrame activeTheme');

  return SHOP_ITEMS.map(item => {
    const owned = item.type === 'avatarFrames'
      ? user.inventory.avatarFrames.includes(item.value)
      : item.type === 'themeColors'
      ? user.inventory.themeColors.includes(item.value)
      : false;

    const equipped = (item.type === 'avatarFrames' && user.activeFrame === item.value) ||
                     (item.type === 'themeColors' && user.activeTheme === item.value);

    return { ...item, owned, equipped };
  });
};

const buyItem = async (userId, itemId) => {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) throw { status: 404, message: '商品不存在' };

  const user = await getUserById(userId);
  if (user.coins < item.price) throw { status: 400, message: '金币不足' };

  const inventory = user.inventory;
  if (item.type === 'avatarFrames') {
    if (inventory.avatarFrames.includes(item.value)) {
      throw { status: 400, message: '已拥有该头像框' };
    }
    inventory.avatarFrames.push(item.value);
  } else if (item.type === 'themeColors') {
    if (inventory.themeColors.includes(item.value)) {
      throw { status: 400, message: '已拥有该主题色' };
    }
    inventory.themeColors.push(item.value);
  } else if (item.type === 'skipCards') {
    inventory.skipCards += 1;
  } else if (item.type === 'renameCards') {
    inventory.renameCards += 1;
  }

  user.coins -= item.price;
  await user.save();

  return { message: `成功购买 ${item.name}！`, newCoins: user.coins, inventory };
};

const useItem = async (userId, itemType, itemValue) => {
  const user = await getUserById(userId);

  const handlers = {
    renameCard: () => {
      if (!itemValue) throw { status: 400, message: '请输入新昵称' };
      if (user.inventory.renameCards <= 0) {
        throw { status: 400, message: '没有改名卡' };
      }
      user.inventory.renameCards -= 1;
      user.nickname = itemValue;
      return '昵称修改成功';
    },
    avatarFrame: () => {
      if (!user.inventory.avatarFrames.includes(itemValue)) {
        throw { status: 400, message: '未拥有该头像框' };
      }
      user.activeFrame = user.activeFrame === itemValue ? '' : itemValue;
      return '装备切换成功';
    },
    theme: () => {
      if (!user.inventory.themeColors.includes(itemValue)) {
        throw { status: 400, message: '未拥有该主题' };
      }
      user.activeTheme = user.activeTheme === itemValue ? '' : itemValue;
      return '装备切换成功';
    }
  };

  const handler = handlers[itemType];
  if (!handler) throw { status: 400, message: '未知物品类型' };

  const message = handler();
  await user.save();

  return {
    message,
    activeFrame: user.activeFrame,
    activeTheme: user.activeTheme,
    nickname: user.nickname,
    inventory: user.inventory
  };
};

const getLeaderboard = async (period = 'all') => {
  if (period === 'weekly' || period === 'monthly') {
    const Checkin = require('../models/Checkin');
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const cst = new Date(now.getTime() - offset + 8 * 3600000);
    const todayStr = cst.toISOString().split('T')[0];

    const startDate = new Date(cst);
    startDate.setDate(startDate.getDate() - (period === 'weekly' ? 7 : 30));
    const startStr = startDate.toISOString().split('T')[0];

    const aggregations = await Checkin.aggregate([
      { $match: { date: { $gte: startStr, $lte: todayStr } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const userIds = aggregations.map(a => a._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username nickname level')
      .lean();

    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    return aggregations.map((a, i) => {
      const u = userMap.get(a._id.toString());
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