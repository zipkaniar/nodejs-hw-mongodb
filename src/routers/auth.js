import express from 'express';
import authController from '../controllers/authController.js';
import { body } from 'express-validator';
import validateBody from '../middlewares/validateBody.js';

const router = express.Router();

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/refresh', authController.refreshSession);
router.post('/logout', authController.logoutUser);

router.post(
  '/send-reset-email',
  validateBody([
    body('email').isEmail().withMessage('Geçerli bir email adresi girin.'),
  ]),
  authController.sendResetEmailController,
);

router.post(
  '/reset-password',
  validateBody([
    body('token').isString().withMessage('Token is required.'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long.'),
  ]),
  authController.resetPassword,
);

export default router;
