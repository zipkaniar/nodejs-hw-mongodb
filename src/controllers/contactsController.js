import { Contact } from '../db/models/Contact.js';
import createError from 'http-errors';
import mongoose from 'mongoose';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, `Invalid ID format: ${contactId}`));
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return next(createError(404, `Contact with ID ${contactId} not found.`));
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with ID ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  try {
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;

    if (!name || !phoneNumber || !contactType) {
      return next(
        createError(
          400,
          'Name, phoneNumber, and contactType are required fields.',
        ),
      );
    }

    const newContact = await Contact.create({
      name,
      phoneNumber,
      email: email || null,
      isFavourite: isFavourite || false,
      contactType,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully created a new contact!',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return next(createError(400, `Invalid ID format: ${contactId}`));
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      req.body,
      { new: true },
    );

    if (!updatedContact) {
      return next(createError(404, `Contact with ID ${contactId} not found.`));
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated contact!',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(400, `Invalid ID format: ${contactId}`);
  }

  const deletedContact = await Contact.findByIdAndDelete(contactId);

  if (!deletedContact) {
    throw createError(404, `Contact with ID ${contactId} not found.`);
  }

  res.status(204).send();
};

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContactById: ctrlWrapper(getContactById),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  deleteContact: ctrlWrapper(deleteContact),
};
