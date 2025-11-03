import User from '../models/user.models.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new ApiError(401, 'Unauthorized request');
  }
  try {
    const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedtoken?._id).select('-password');
    if (!user) {
      throw new ApiError(401, 'Invalid Token');
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid Token');
  }
});
