import express from 'express';
import {
  isAuth,
  login,
  logout,
  registerUser,
} from '../controllers/user.controllers.js';
import { verifyJWT } from '../middlewares/user.middleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', login);
userRouter.get('/is-auth', verifyJWT, isAuth);
userRouter.get('/logout', verifyJWT, logout);

export default userRouter;
