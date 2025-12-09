import express from 'express';
import {
  isAuth,
  login,
  logout,
  registerUser,
} from '../controllers/user.controllers.js';
import { verifyJWT } from '../middlewares/user.middleware.js';
import passport from "../utils/passport-config.js"
import { asyncHandler } from '../utils/async-handler.js';
import { setAuthCookie } from '../controllers/user.controllers.js';

const userRouter = express.Router();

// unsecured routes
userRouter.post('/register', registerUser);
userRouter.post('/login', login);

// secure routes
userRouter.get('/is-auth', verifyJWT, isAuth);
userRouter.get('/logout', verifyJWT, logout);

// Google login routes
userRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userRouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  asyncHandler(async (req, res) => {
    const token = req.user.generateToken();

    // set cookie with same options as register/login
    setAuthCookie(res, token);

    const safeUser = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider,
      googleId: req.user.googleId,
    };

    return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
  })
);


export default userRouter;
