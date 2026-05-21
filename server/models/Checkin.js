/**
 * DailyHabit 打卡记录数据模型
 * 作者：朱其浩
 */

const mongoose = require('mongoose');

const checkinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 复合唯一索引：同一天对同一习惯不能重复打卡
checkinSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });
// 按用户查询打卡历史（按日期倒序）
checkinSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Checkin', checkinSchema);
