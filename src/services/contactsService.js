import { Contact } from '../db/models/Contact.js';

export const findAllContacts = async () => {
  return await Contact.find();
};
