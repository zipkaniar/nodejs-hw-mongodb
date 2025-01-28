import { Contact } from '../db/models/Contact.js';

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to get contacts.',
      error: error.message,
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({
        status: 404,
        message: `Contact with ID ${contactId} not found.`,
      });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with ID ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to get contact by ID.',
      error: error.message,
    });
  }
};

export const createContact = async (req, res) => {
  try {
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;

    if (!name || !phoneNumber || !contactType) {
      return res.status(400).json({
        status: 400,
        message: 'Name, phoneNumber, and contactType are required fields.',
      });
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
      data: {
        _id: newContact._id,
        name: newContact.name,
        phoneNumber: newContact.phoneNumber,
        email: newContact.email,
        isFavourite: newContact.isFavourite,
        contactType: newContact.contactType,
        createdAt: newContact.createdAt,
        updatedAt: newContact.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to create a new contact.',
      error: error.message,
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    // Verilen ID'ye sahip iletişim bilgisini sil
    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).json({
        status: 404,
        message: `Contact with ID ${contactId} not found.`,
      });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully deleted contact with ID ${contactId}!`,
      data: deletedContact,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to delete contact.',
      error: error.message,
    });
  }
};
