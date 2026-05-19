const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dailyhabit';
    await mongoose.connect(uri);
    console.log('MongoDB 连接成功');
  } catch (err) {
    console.error('MongoDB 连接失败:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
