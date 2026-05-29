/**
 * DailyHabit 用户数据模型
 * 作者：李亚恒
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20
  },
  password: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    default: function() { return this.username; }
  },
  avatar: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  totalCheckins: { type: Number, default: 0 },
  lastLoginDate: { type: String, default: '' },
  inventory: {
    skipCards: { type: Number, default: 0 },
    renameCards: { type: Number, default: 0 },
    avatarFrames: [{ type: String }],
    themeColors: [{ type: String }]
  },
  // 当前装备的外观
  activeFrame: { type: String, default: '' },
  activeTheme: { type: String, default: '' }
}, {
  timestamps: true
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
