# DailyHabit - 每日习惯打卡游戏

游戏化的习惯养成 Web 应用，通过经验值、等级、金币、成就激励用户坚持好习惯。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + TypeScript + Tailwind CSS |
| 后端 | Node.js + Express |
| 数据库 | MongoDB + Mongoose |
| 认证 | JWT + bcryptjs |

## 团队分工

| 成员 | 角色 | 负责模块 |
|------|------|---------|
| 李亚恒 | 组长/PM | 用户管理 (UserService) |
| 朱其浩 | 技术负责人 | 打卡系统 (CheckinService) |
| 张嵩林 | 开发/测试 | 游戏化系统 (GameService) |

## 快速启动

```bash
# 后端（端口 8080）
cd server && npm install && npm run dev

# 前端（端口 3000）
cd client && npm install && npm start
```

## 项目结构

```
├── server/                # 后端
│   ├── models/           # 数据模型
│   ├── services/         # 核心业务逻辑（三人分工）
│   ├── controllers/      # 路由控制器
│   ├── routes/           # API 路由
│   └── middleware/auth.js # JWT 认证
├── client/               # 前端
│   └── src/
│       ├── pages/        # 7 个页面
│       └── components/   # 6 个 UI 组件
```

## API 接口

### 用户模块 `/api/users`
- `POST /register` - 注册
- `POST /login` - 登录
- `GET /profile` - 获取信息
- `PUT /profile` - 修改信息
- `PUT /password` - 修改密码
- `GET /:userId/level` - 等级经验

### 打卡模块 `/api`
- `POST /checkins` - 打卡
- `GET /checkins/today` - 今日状态
- `GET /checkins/history` - 打卡历史
- `GET /habits` - 习惯列表
- `POST /habits` - 创建习惯
- `PUT /habits/:id` - 编辑习惯
- `DELETE /habits/:id` - 归档习惯

### 游戏模块 `/api/game`
- `GET /status` - 游戏状态
- `GET /achievements` - 成就列表
- `POST /daily-login` - 每日登录奖励

## 预设成就

🌱 初出茅庐 → 💪 三天成习 → 🔥 坚持一周 → 👑 月度达人 → 🎯 半百打卡 → 🏆 百次打卡 → ⭐ 小有所成 → 🌟 登峰造极
