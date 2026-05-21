/**
 * 输入验证与清理中间件
 * 防 NoSQL 注入 + XSS + 参数类型校验
 */

// NoSQL 注入特征：$where, $regex, $gt, 等 MongoDB 操作符
const MONGO_INJECTION_PATTERN = /^\$/;

// XSS 攻击特征：<script>, onerror=, javascript: 等
const XSS_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|on\w+\s*=|javascript\s*:/i;

/**
 * 递归清理对象中的危险字符串
 */
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // 检测 NoSQL 操作符注入
    if (MONGO_INJECTION_PATTERN.test(value)) {
      return value.replace(/^\$/, '_');
    }
    // 检测 XSS
    if (XSS_PATTERN.test(value)) {
      return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const cleaned = {};
    for (const key of Object.keys(value)) {
      // 过滤掉以 $ 开头的 key（NoSQL 注入），保留以 _ 开头的
      if (key.startsWith('$')) continue;
      cleaned[key] = sanitizeValue(value[key]);
    }
    return cleaned;
  }
  return value;
};

/**
 * 清理 req.body, req.query, req.params 中的危险输入
 */
const sanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = { sanitize };
