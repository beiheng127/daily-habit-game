# DailyHabit - 每日习惯打卡游戏

## 项目简介
DailyHabit 是一款游戏化的习惯养成 Web 应用，用户可创建个人习惯，每天打卡记录完成情况，通过经验值、等级、金币、成就等游戏机制激励用户坚持。

## 技术栈
- **前端：** React + TypeScript + Tailwind CSS
- **后端：** Node.js + Express
- **数据库：** MongoDB (Mongoose)
- **认证：** JWT + bcrypt

## 团队成员
| 成员 | 角色 | 负责模块 |
|------|------|---------|
| 李亚恒 | 组长/PM | 用户管理模块 (UserService) |
| 朱其浩 | 技术负责人 | 打卡系统模块 (CheckinService) |
| 张嵩林 | 开发/测试 | 游戏化系统模块 (GameService) |

## 项目结构
```
daily-habit-game/
├── server/          # 后端代码
│   ├── config/      # 数据库连接配置
│   ├── models/      # Mongoose 数据模型
│   ├── services/    # 业务逻辑服务层
│   ├── controllers/ # 路由控制器
│   ├── routes/      # API 路由定义
│   └── middleware/   # JWT 认证中间件
├── client/          # 前端代码 (React + TypeScript)
│   └── src/
│       ├── pages/       # 页面组件
│       ├── components/  # 可复用组件
│       ├── services/    # API 调用封装
│       ├── context/     # 认证上下文
│       └── types/       # TypeScript 类型定义
```

## 快速启动

### 环境要求
- Node.js 18+
- MongoDB 6.x+ (或 MongoDB Atlas 云服务)

### 后端启动
```bash
cd server
npm install
npm run dev
```

### 前端启动
```bash
cd client
npm install
npm start
```

## API 接口

### 用户模块 (/api/users)
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/users/register | 注册 | 否 |
| POST | /api/users/login | 登录 | 否 |
| GET | /api/users/profile | 获取用户信息 | 是 |
| PUT | /api/users/profile | 修改用户信息 | 是 |
| PUT | /api/users/password | 修改密码 | 是 |
| GET | /api/users/:userId/level | 查询等级经验 | 是 |

### 打卡模块 (/api/checkins, /api/habits)
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/checkins | 打卡 | 是 |
| GET | /api/checkins/today | 今日打卡状态 | 是 |
| GET | /api/checkins/history | 打卡历史 | 是 |
| GET | /api/habits | 习惯列表 | 是 |
| POST | /api/habits | 创建习惯 | 是 |
| PUT | /api/habits/:habitId | 编辑习惯 | 是 |
| DELETE | /api/habits/:habitId | 归档习惯 | 是 |

### 游戏化模块 (/api/game)
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/game/status | 游戏状态 | 是 |
| GET | /api/game/achievements | 成就列表 | 是 |
| POST | /api/game/daily-login | 每日登录奖励 | 是 |
