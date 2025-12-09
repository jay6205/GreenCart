import User from '../models/user.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // <-- important for cross-site cookies
  maxAge: COOKIE_MAX_AGE,
  path: '/', // ensures cookie sent for all backend routes
};

export const COOKIE_OPTIONS = cookieOptions;
export const setAuthCookie = (res, token) => res.cookie('token', token, COOKIE_OPTIONS);



// api/user/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'Bad Request');
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, 'User with same email already exists', []);
  }

  const user = await User.create({
    name,
    email,
    password,
  });
  const token = user.generateToken();

  res.cookie('token', token, cookieOptions);
  const safeUser = await User.findById(user._id).select('-password');
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: safeUser,
      },
      'User registered successfully'
    )
  );
});

// api/user/login

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is Required');
  }
  if (!password) {
    throw new ApiError(400, 'Password is Required');
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, 'User does not exist');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, 'Incorrect Password');
  }

  const loggedInUser = await User.findById(user._id).select('-password');

  const token = user.generateToken();

  res.cookie('token', token, cookieOptions);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,
      },
      'User Logged in Successfully'
    )
  );
});

// api/user/is-auth
const isAuth = asyncHandler(async (req, res) => {
  const user = req.user;
  return res.status(200).json(
    new ApiResponse(200, {
      user: user,
    })
  );
});

// api/user/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOptions);
  return res
    .status(200)
    .json(new ApiResponse(201, {}, 'Logged Out Successfully'));
});

export { registerUser, login, logout, isAuth };
