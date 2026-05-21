/**
 * DailyHabit 成就模板数据模型
 * 作者：张嵩林
 */

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  condition: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  reward: {
    exp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);
