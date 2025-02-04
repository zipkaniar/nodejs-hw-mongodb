import mongoose from 'mongoose';

const isValidId = async (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res
      .status(400)
      .json({ status: 400, message: 'Geçersiz ID formatı.' });
  }

  next();
};

export default isValidId;
