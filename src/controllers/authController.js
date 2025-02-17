import createError from 'http-errors';
import authService from '../services/authService.js';
import { sendResetEmail } from '../services/emailService.js';
import { User } from '../db/models/index.js';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(createError(400, 'Name, email, and password are required.'));
    }

    const newUser = await authService.registerUser({ name, email, password });

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, 'Email and password are required.'));
    }

    const { accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createError(401, 'Refresh token is required'));
    }

    const { accessToken, newRefreshToken } = await authService.refreshSession(
      refreshToken,
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createError(401, 'Refresh token is required'));
    }

    await authService.logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const sendResetEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(createError(404, 'User not found!'));
    }

    const response = await sendResetEmail(email);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const { JWT_SECRET } = process.env;

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return next(createError(401, 'Token is expired or invalid.'));
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return next(createError(404, 'User not found!'));
    }

    await authService.updateUserPassword(user._id, password);

    await authService.invalidateUserSessions(user._id);

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
export default {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  sendResetEmailController,
  resetPassword,
};
