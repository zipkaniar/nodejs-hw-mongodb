import express from 'express';
import { body } from 'express-validator';
import contactsController from '../controllers/contactsController.js';
import validateBody from '../middlewares/validateBody.js';
import isValidId from '../middlewares/isValidId.js';
import authenticate from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', authenticate, contactsController.getAllContacts);

router.get(
  '/:contactId',
  authenticate,
  isValidId,
  contactsController.getContactById,
);

router.post(
  '/',
  authenticate,
  validateBody([
    body('name')
      .isString()
      .isLength({ min: 3, max: 20 })
      .withMessage('İsim en az 3, en fazla 20 karakter olmalıdır.'),
    body('email').isEmail().withMessage('Geçerli bir email adresi girin.'),
    body('phoneNumber')
      .isMobilePhone()
      .withMessage('Geçerli bir telefon numarası girin.'),
    body('contactType')
      .isString()
      .notEmpty()
      .withMessage('İletişim türü zorunludur.'),
  ]),
  contactsController.createContact,
);

router.patch(
  '/:contactId',
  authenticate,
  isValidId,
  validateBody([
    body('name')
      .optional()
      .isString()
      .isLength({ min: 3, max: 20 })
      .withMessage('İsim en az 3, en fazla 20 karakter olmalıdır.'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Geçerli bir email adresi girin.'),
    body('phoneNumber') // ✅ "phone" yerine "phoneNumber" olmalı
      .optional()
      .isMobilePhone()
      .withMessage('Geçerli bir telefon numarası girin.'),
  ]),
  contactsController.updateContact,
);

router.delete(
  '/:contactId',
  authenticate,
  isValidId,
  contactsController.deleteContact,
);

export default router;
