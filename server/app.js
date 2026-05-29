/**
 * DailyHabit 每日习惯打卡游戏 - 后端入口
 * 作者：李亚恒
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const Achievement = require('./models/Achievement');
const validate = require('./middleware/validate');

// 路由
const userRoutes = require('./routes/userRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 输入清理中间件（防 NoSQL 注入 + XSS）
app.use(validate.sanitize);

// 全局限流：每IP每分钟最多100次请求
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '请求过于频繁，请稍后再试', data: null }
}));

// 认证接口限流：注册/登录每IP每分钟最多5次（防暴力破解）
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '操作过于频繁，请1分钟后再试', data: null }
});

// 路由挂载（限流中间件必须在路由之前）
app.use('/api/users/register', authLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users', userRoutes);
app.use('/api', checkinRoutes);
app.use('/api/game', gameRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: 'DailyHabit API is running', data: null });
});

// 错误处理中间件（带日志）
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${status} - ${err.message}`;
  if (status >= 500) {
    console.error(logEntry, err.stack || '');
  } else {
    console.warn(logEntry);
  }
  res.status(status).json({
    code: status,
    message: status >= 500 ? '服务器内部错误' : err.message,
    data: null
  });
});

// 初始化预设成就
const initAchievements = async () => {
  const count = await Achievement.countDocuments();
  if (count > 0) return;

  const achievements = [
    { key: 'first_checkin', name: '初出茅庐', description: '完成第一次打卡', icon: '🌱', condition: { type: 'totalCheckins', value: 1 }, reward: { exp: 20, coins: 10 } },
    { key: 'streak_3', name: '三天成习', description: '连续打卡3天', icon: '💪', condition: { type: 'streak', value: 3 }, reward: { exp: 30, coins: 20 } },
    { key: 'streak_7', name: '坚持一周', description: '连续打卡7天', icon: '🔥', condition: { type: 'streak', value: 7 }, reward: { exp: 50, coins: 30 } },
    { key: 'streak_30', name: '月度达人', description: '连续打卡30天', icon: '👑', condition: { type: 'streak', value: 30 }, reward: { exp: 200, coins: 100 } },
    { key: 'checkin_50', name: '半百打卡', description: '累计打卡50次', icon: '🎯', condition: { type: 'totalCheckins', value: 50 }, reward: { exp: 100, coins: 50 } },
    { key: 'checkin_100', name: '百次打卡', description: '累计打卡100次', icon: '🏆', condition: { type: 'totalCheckins', value: 100 }, reward: { exp: 300, coins: 150 } },
    { key: 'level_5', name: '小有所成', description: '达到5级', icon: '⭐', condition: { type: 'level', value: 5 }, reward: { exp: 50, coins: 30 } },
    { key: 'level_10', name: '登峰造极', description: '达到10级', icon: '🌟', condition: { type: 'level', value: 10 }, reward: { exp: 200, coins: 100 } }
  ];

  await Achievement.insertMany(achievements);
  console.log('预设成就初始化完成');
};

// 启动服务
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await connectDB();
  await initAchievements();
  app.listen(PORT, () => {
    console.log(`DailyHabit 服务器启动成功，端口: ${PORT}`);
  });
};

startServer();

module.exports = app;
