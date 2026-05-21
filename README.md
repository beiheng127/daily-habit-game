# DailyHabit - 每日习惯打卡游戏

🎮 游戏化的习惯养成 Web 应用，通过经验值、等级、金币、成就系统激励用户坚持好习惯。

## ✨ 功能特性

- 🔐 **用户认证** - 注册、登录、个人资料管理
- 📝 **习惯管理** - 创建、编辑、归档习惯
- ✅ **每日打卡** - 记录每日习惯完成情况
- 📊 **数据统计** - 打卡历史、连续天数统计
- 🎯 **成就系统** - 8种预设成就解锁
- 🏆 **等级系统** - 经验值累计升级
- 💰 **金币奖励** - 打卡和成就奖励
- 📱 **响应式设计** - 支持多种设备

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | ^18.2.0 |
| 前端语言 | TypeScript | ^5.2.2 |
| 样式框架 | Tailwind CSS | ^3.3.5 |
| 状态管理 | React Context | - |
| 动画库 | Framer Motion | ^12.39.0 |
| 后端框架 | Express | ^4.18.2 |
| 数据库 | MongoDB + Mongoose | ^7.6.3 |
| 认证方式 | JWT + bcryptjs | - |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- MongoDB >= 6.x

### 安装依赖

```bash
# 后端 (端口 8080)
cd server
npm install
npm run dev

# 前端 (端口 3000)
cd client
npm install --legacy-peer-deps
npm start
```

### 项目配置

后端服务启动后自动连接 `mongodb://localhost:27017/dailyhabit`，并初始化预设成就数据。

## 📁 项目结构

```
daily-habit-game/
├── server/                    # 后端 Express 服务
│   ├── config/               # 配置文件
│   │   └── db.js             # 数据库连接
│   ├── controllers/          # 路由控制器
│   │   ├── CheckinController.js
│   │   ├── GameController.js
│   │   └── UserController.js
│   ├── middleware/           # 中间件
│   │   ├── auth.js           # JWT 认证
│   │   └── validate.js       # 参数校验
│   ├── models/               # Mongoose 模型
│   │   ├── Achievement.js
│   │   ├── Checkin.js
│   │   ├── Habit.js
│   │   ├── User.js
│   │   └── UserAchievement.js
│   ├── routes/               # API 路由
│   │   ├── checkinRoutes.js
│   │   ├── gameRoutes.js
│   │   └── userRoutes.js
│   ├── services/             # 核心业务逻辑
│   │   ├── CheckinService.js
│   │   ├── GameService.js
│   │   └── UserService.js
│   ├── app.js                # 应用入口
│   └── package.json
├── client/                   # 前端 React 应用
│   ├── public/               # 静态资源
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   │   ├── AchievementCard.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── CheckinButton.tsx
│   │   │   ├── HabitCard.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── StatsChart.tsx
│   │   ├── context/          # 全局状态
│   │   │   └── AuthContext.tsx
│   │   ├── pages/            # 页面组件
│   │   │   ├── AchievementPage.tsx
│   │   │   ├── CheckinPage.tsx
│   │   │   ├── HabitListPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── LeaderboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ShopPage.tsx
│   │   ├── services/         # API 服务
│   │   │   └── api.ts
│   │   ├── types/            # TypeScript 类型定义
│   │   │   └── index.ts
│   │   ├── App.tsx           # 应用根组件
│   │   ├── index.css         # 全局样式
│   │   └── index.tsx         # 入口文件
│   └── package.json
└── README.md
```

## 🔌 API 接口

### 用户模块 `/api/users`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/register` | 用户注册 |
| POST | `/login` | 用户登录 |
| GET | `/profile` | 获取用户信息 |
| PUT | `/profile` | 更新用户信息 |
| PUT | `/password` | 修改密码 |
| GET | `/:userId/level` | 获取用户等级 |

### 打卡模块 `/api`

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/checkins` | 完成打卡 |
| GET | `/checkins/today` | 获取今日打卡状态 |
| GET | `/checkins/history` | 获取打卡历史 |
| GET | `/habits` | 获取习惯列表 |
| POST | `/habits` | 创建新习惯 |
| PUT | `/habits/:id` | 更新习惯 |
| DELETE | `/habits/:id` | 归档习惯 |

### 游戏模块 `/api/game`

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/status` | 获取游戏状态 |
| GET | `/achievements` | 获取成就列表 |
| POST | `/daily-login` | 领取每日登录奖励 |

## 🏅 成就系统

| 图标 | 成就名称 | 解锁条件 | 奖励 |
|------|----------|----------|------|
| 🌱 | 初出茅庐 | 完成第一次打卡 | 20经验 + 10金币 |
| 💪 | 三天成习 | 连续打卡3天 | 30经验 + 20金币 |
| 🔥 | 坚持一周 | 连续打卡7天 | 50经验 + 30金币 |
| 👑 | 月度达人 | 连续打卡30天 | 200经验 + 100金币 |
| 🎯 | 半百打卡 | 累计打卡50次 | 100经验 + 50金币 |
| 🏆 | 百次打卡 | 累计打卡100次 | 300经验 + 150金币 |
| ⭐ | 小有所成 | 达到5级 | 50经验 + 30金币 |
| 🌟 | 登峰造极 | 达到10级 | 200经验 + 100金币 |

## 👥 团队成员

| 成员 | 角色 | 负责模块 |
|------|------|---------|
| 李亚恒 | 组长/PM | 用户管理 (UserService) |
| 朱其浩 | 技术负责人 | 打卡系统 (CheckinService) |
| 张嵩林 | 开发/测试 | 游戏化系统 (GameService) |

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请联系项目负责人。