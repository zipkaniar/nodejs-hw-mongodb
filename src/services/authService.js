import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../db/models/User.js';
import Session from '../db/models/Session.js';

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError(401, 'Invalid email or password');
  }

  await Session.deleteMany({ userId: user._id });

  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

const refreshSession = async (refreshToken) => {
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    throw createError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw createError(401, 'User not found');
  }

  await Session.deleteMany({ refreshToken });

  const newAccessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const newRefreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    },
  );

  await Session.create({
    userId: user._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken: newAccessToken, newRefreshToken };
};

const logoutUser = async (refreshToken) => {
  await Session.deleteOne({ refreshToken });
};

const updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
};

const invalidateUserSessions = async (userId) => {
  await Session.deleteMany({ userId });
};

export default {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  updateUserPassword,
  invalidateUserSessions,
};
