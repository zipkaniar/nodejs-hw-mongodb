import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model('Contact', contactSchema);
