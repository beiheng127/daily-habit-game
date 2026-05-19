const UserService = require('../services/UserService');

const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const result = await UserService.register(username, password, email);
    res.json({ code: 200, message: '注册成功', data: result });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await UserService.login(username, password);
    res.json({ code: 200, message: '登录成功', data: result });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await UserService.getProfile(req.userId);
    res.json({ code: 200, data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await UserService.updateProfile(req.userId, req.body);
    res.json({ code: 200, message: '修改成功', data: user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await UserService.changePassword(req.userId, oldPassword, newPassword);
    res.json({ code: 200, message: result.message, data: null });
  } catch (err) {
    next(err);
  }
};

const getLevelInfo = async (req, res, next) => {
  try {
    const result = await UserService.getLevelInfo(req.params.userId);
    res.json({ code: 200, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword, getLevelInfo };
