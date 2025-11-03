import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: {
      type: Array,
      required: true,
    },
    price: { type: Number, required: [true, 'Price is required'] },
    offerPrice: { type: Number, required: [true, 'Price is required'] },
    image: { type: Array, required: [true, 'At least one image is required'] },
    category: { type: String, required: [true, 'Category is required'] },
    inStock: { type: Boolean, default: true },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const Product =
  mongoose.models.product || mongoose.model('product', productSchema);

export default Product;
