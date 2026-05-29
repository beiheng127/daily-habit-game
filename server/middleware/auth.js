/**
 * DailyHabit JWT 认证中间件
 * 作者：李亚恒
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('[安全警告] 未设置 JWT_SECRET 环境变量，正在使用不安全的默认密钥！请在生产环境中设置 JWT_SECRET。');
}
const SECRET = JWT_SECRET || 'dailyhabit_secret_key_dev_only';

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供token', data: null });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token无效或已过期', data: null });
  }
};

module.exports = auth;
