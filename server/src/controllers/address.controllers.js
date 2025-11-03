import User from '../models/user.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Address from '../models/address.models.js';

// /api/address/add
const addAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;
  const userId = req.user._id;
  const newAddress = await Address.create({ ...address, userId });
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { address: newAddress },
        'Address added successfully'
      )
    );
});

// /api/address/get
const getAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const addresses = await Address.find({ userId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { addresses: addresses },
        'Addresses fetched successfully'
      )
    );
});

export { addAddress, getAddress };
