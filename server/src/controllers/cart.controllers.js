import User from '../models/user.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// /api/cart/update
const updateCart = asyncHandler(async (req, res) => {
  const { userId, cartItems } = req.body;
  if (!userId) {
    throw new ApiError(404, 'User not found');
  }
  const user = await User.findByIdAndUpdate(userId, { cartItems });
  if (!user) {
    throw new ApiError(400, 'Bad Request');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Cart Updated successfully'));
});

export { updateCart };
