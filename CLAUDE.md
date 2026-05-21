# Daily Habit Game — 项目 CLAUDE.md
# 全局行为规则在 ~/.claude/CLAUDE.md，此处仅项目特定信息

## 项目架构
- **Stack**: MERN (MongoDB + Express + React + Node.js) + TypeScript + Tailwind CSS
- **前端**: CRA (react-scripts 5.0.1), proxy -> http://localhost:8080
- **后端**: Express port 8080, MongoDB mongodb://localhost:27017/dailyhabit
- **JWT secret**: dailyhabit_secret_key
- **npm install**: 需用 --legacy-peer-deps

## 目录结构
- server/ — Express API (models/routes/controllers/services/middleware)
- client/ — React CRA + Tailwind CSS + framer-motion
- client/src/pages/ — 11 个页面组件
- client/src/components/ — Navbar, Skeleton, StatsChart, HabitCard 等

## 关键设计模式
- Toast: 顶部居中 AnimatePresence + motion.div
- 卡片: .glass-card = bg-white/75 + backdrop-blur-12
- 骨架屏: .skeleton = 渐变 shimmer 动画
- 品牌色: brand-* (indigo) + accent-* (emerald)

## 模块责任人
- 李亚恒 (PM): UserService, User model
- 朱其浩 (Tech Lead): CheckinService, Habit/Checkin models
- 张嵩林 (Dev/Test): GameService, Achievement models
