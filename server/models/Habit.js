const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '⭐'
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekdays', 'custom'],
    default: 'daily'
  },
  customDays: {
    type: [Number],
    default: []
  },
  reminderTime: {
    type: String,
    default: ''
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  currentStreak: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habit', habitSchema);
