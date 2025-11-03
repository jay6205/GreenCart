import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/async-handler.js';
import User from '../models/user.models.js';
import { ApiError } from '../utils/api-error.js';

export const authSeller = asyncHandler(async (req, res, next) => {
  const { sellerToken } = req.cookies;
  if (!sellerToken) {
    throw new ApiError(401, 'Unauthorized request');
  }
  try {
    const decodedtoken = jwt.verify(
      sellerToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (decodedtoken.email === process.env.SELLER_EMAIL) {
      next();
    } else {
      throw new ApiError(401, 'Unauthorized request');
    }
  } catch (error) {
    throw new ApiError(401, 'Invalid Token');
  }
});
