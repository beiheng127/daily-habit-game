/**
 * DailyHabit 游戏化模块控制器
 * 作者：张嵩林
 */

const GameService = require('../services/GameService');

const getGameStatus = async (req, res, next) => {
  try {
    const status = await GameService.getGameStatus(req.userId);
    res.json({ code: 200, data: status });
  } catch (err) {
    next(err);
  }
};

const getAchievements = async (req, res, next) => {
  try {
    const achievements = await GameService.getAllAchievements(req.userId);
    res.json({ code: 200, data: achievements });
  } catch (err) {
    next(err);
  }
};

const claimDailyLogin = async (req, res, next) => {
  try {
    const result = await GameService.claimDailyLogin(req.userId);
    if (result.claimed) {
      res.json({ code: 200, message: `领取成功 +${result.coins} 金币`, data: result });
    } else {
      res.json({ code: 200, message: result.message, data: result });
    }
  } catch (err) {
    next(err);
  }
};

const getShopItems = async (req, res, next) => {
  try {
    const items = await GameService.getShopItems(req.userId);
    res.json({ code: 200, data: items });
  } catch (err) {
    next(err);
  }
};

const buyItem = async (req, res, next) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ code: 400, message: '缺少商品ID', data: null });
    }
    const result = await GameService.buyItem(req.userId, itemId);
    res.json({ code: 200, message: result.message, data: result });
  } catch (err) {
    next(err);
  }
};

const useItem = async (req, res, next) => {
  try {
    const { itemType, itemValue } = req.body;
    if (!itemType) {
      return res.status(400).json({ code: 400, message: '缺少物品类型', data: null });
    }
    const result = await GameService.useItem(req.userId, itemType, itemValue);
    res.json({ code: 200, message: result.message, data: result });
  } catch (err) {
    next(err);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const { period } = req.query;
    const leaderboard = await GameService.getLeaderboard(period || 'all');
    res.json({ code: 200, data: leaderboard });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGameStatus, getAchievements, claimDailyLogin, getShopItems, buyItem, useItem, getLeaderboard };
