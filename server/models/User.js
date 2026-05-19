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
  lastLoginDate: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
