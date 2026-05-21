/**
 * DailyHabit 用户管理模块
 * 作者：李亚恒（组长/PM）
 * 负责：用户注册/登录/信息管理/JWT认证/等级查询
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dailyhabit_secret_key';

/**
 * 生成JWT Token
 */
const generateToken = (userId, username) => {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * 计算等级信息
 */
const calculateLevel = (exp) => {
  const level = Math.floor(exp / 100) + 1;
  const expToNext = level * 100;
  const expProgress = exp % 100;
  return { level, expToNext, expProgress };
};

/**
 * 用户注册
 */
const register = async (username, password, email) => {
  // 校验 username 格式
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw { status: 400, message: '用户名需为3-20位字母、数字或下划线' };
  }

  // 校验 password 强度
  if (!password || password.length < 8 || password.length > 30) {
    throw { status: 400, message: '密码需为8-30位' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  if (!hasLetter || !hasDigit) {
    throw { status: 400, message: '密码必须同时包含字母和数字' };
  }

  // 校验 email 格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw { status: 400, message: '邮箱格式不正确' };
  }

  // 检查 username 和 email 是否已存在
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existingUser) {
    if (existingUser.username === username) {
      throw { status: 409, message: '用户名已存在' };
    }
    throw { status: 409, message: '邮箱已被注册' };
  }

  // 密码加密
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = await User.create({
    username,
    password: hashedPassword,
    email,
    nickname: username
  });

  return {
    userId: user._id,
    username: user.username,
    nickname: user.nickname,
    level: user.level,
    exp: user.exp,
    coins: user.coins
  };
};

/**
 * 用户登录
 */
const login = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw { status: 400, message: '用户名或密码错误' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { status: 400, message: '用户名或密码错误' };
  }

  const token = generateToken(user._id, user.username);

  return {
    token,
    user: {
      userId: user._id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      exp: user.exp,
      coins: user.coins,
      inventory: user.inventory,
      activeFrame: user.activeFrame,
      activeTheme: user.activeTheme
    }
  };
};

/**
 * 获取用户信息
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }
  return user;
};

/**
 * 修改用户信息（昵称/头像）
 */
const updateProfile = async (userId, updates) => {
  const allowedFields = {};
  if (updates.nickname !== undefined) allowedFields.nickname = updates.nickname;
  if (updates.avatar !== undefined) allowedFields.avatar = updates.avatar;

  const user = await User.findByIdAndUpdate(userId, allowedFields, { new: true }).select('-password');
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }
  return user;
};

/**
 * 修改密码
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw { status: 400, message: '原密码错误' };
  }

  if (!newPassword || newPassword.length < 8 || newPassword.length > 30) {
    throw { status: 400, message: '新密码需为8-30位' };
  }
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  if (!hasLetter || !hasDigit) {
    throw { status: 400, message: '密码必须同时包含字母和数字' };
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return { message: '密码修改成功' };
};

/**
 * 获取用户等级和經驗信息
 */
const getLevelInfo = async (userId) => {
  const user = await User.findById(userId).select('level exp');
  if (!user) {
    throw { status: 404, message: '用户不存在' };
  }

  const { expToNext, expProgress } = calculateLevel(user.exp);

  return {
    userId: user._id,
    level: user.level,
    exp: user.exp,
    expToNext,
    expProgress
  };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getLevelInfo,
  calculateLevel
};
