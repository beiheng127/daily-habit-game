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

module.exports = { getGameStatus, getAchievements, claimDailyLogin };
