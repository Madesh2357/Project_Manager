const jwt = require('jsonwebtoken');
const config = require('../config');

const revokedTokens = new Set();

function revokeToken(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded?.exp) {
      revokedTokens.add(token);
      const ttl = decoded.exp * 1000 - Date.now();
      if (ttl > 0) {
        setTimeout(() => revokedTokens.delete(token), ttl);
      }
    }
  } catch {
    revokedTokens.add(token);
  }
}

function isTokenRevoked(token) {
  return revokedTokens.has(token);
}

function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}

module.exports = {
  revokeToken,
  isTokenRevoked,
  signToken,
  verifyToken,
};
