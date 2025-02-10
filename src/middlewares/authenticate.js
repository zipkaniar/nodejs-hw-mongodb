import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../db/models/User.js';

const authenticate = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return next(createError(401, 'Access token required'));
    }

    const token = authorization.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(createError(401, 'Invalid or expired access token'));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(createError(401, 'User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
