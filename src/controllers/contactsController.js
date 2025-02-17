import Contact from '../db/models/Contact.js';
import createError from 'http-errors';
import mongoose from 'mongoose';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { uploadImage } from '../services/cloudinaryService.js';

const getAllContacts = async (req, res, next) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      isFavourite,
      contactType,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const perPageNumber = parseInt(perPage, 10);

    if (pageNumber < 1 || perPageNumber < 1) {
      return next(createError(400, 'Page and perPage must be greater than 0.'));
    }

    const validSortFields = ['name', 'email', 'phoneNumber', 'contactType'];
    if (!validSortFields.includes(sortBy)) {
      return next(
        createError(
          400,
          `Invalid sortBy value. Use one of: ${validSortFields.join(', ')}`,
        ),
      );
    }

    const sortOptions = { asc: 1, desc: -1 };
    const sortDirection = sortOptions[sortOrder] ?? 1;

    const filter = { userId: req.user._id };

    if (isFavourite !== undefined) {
      if (isFavourite !== 'true' && isFavourite !== 'false') {
        return next(createError(400, "isFavourite must be 'true' or 'false'."));
      }
      filter.isFavourite = isFavourite === 'true';
    }

    if (contactType) {
      const validContactTypes = ['work', 'personal', 'home'];
      if (!validContactTypes.includes(contactType)) {
        return next(
          createError(
            400,
            `Invalid contactType. Use one of: ${validContactTypes.join(', ')}`,
          ),
        );
      }
      filter.contactType = contactType;
    }

    const totalItems = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * perPageNumber)
      .limit(perPageNumber);

    const totalPages = Math.ceil(totalItems / perPageNumber);

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: {
        data: contacts,
        page: pageNumber,
        perPage: perPageNumber,
        totalItems,
        totalPages,
        hasPreviousPage: pageNumber > 1,
        hasNextPage: pageNumber < totalPages,
      },
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

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file.path);
    }

    const newContact = await Contact.create({
      name,
      phoneNumber,
      email: email || null,
      isFavourite: isFavourite || false,
      contactType,
      userId: req.user._id,
      photo: imageUrl,
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
      {
        new: true,
      },
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
