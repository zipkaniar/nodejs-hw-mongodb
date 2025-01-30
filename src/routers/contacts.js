import express from 'express';
import contactsController from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', contactsController.getAllContacts);
router.get('/:contactId', contactsController.getContactById);
router.post('/', contactsController.createContact);
router.patch('/:contactId', contactsController.updateContact);
router.delete('/:contactId', contactsController.deleteContact);

export default router;
