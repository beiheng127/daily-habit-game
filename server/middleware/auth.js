const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dailyhabit_secret_key';

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未提供token', data: null });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'token无效或已过期', data: null });
  }
};

module.exports = auth;
