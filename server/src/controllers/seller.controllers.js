import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// api/seller/login
const sellerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let token;
  if (
    password === process.env.SELLER_PASSWORD &&
    email === process.env.SELLER_EMAIL
  ) {
    token = jwt.sign(
      {
        email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '1d',
      }
    );
    res.cookie('sellerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'Seller Logged in Successfully'));
  } else {
    throw new ApiError(401, 'Invalid credentials');
  }
});

// api/seller/is-auth
const isSellerAuth = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json(
    new ApiResponse(200, {
      user: user,
    })
  );
});

// api/seller/logout
const sellerLogout = asyncHandler(async (req, res) => {
  res.clearCookie('sellerToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  return res
    .status(200)
    .json(new ApiResponse(201, {}, 'Logged Out Successfully'));
});

export { sellerLogin, isSellerAuth, sellerLogout };
