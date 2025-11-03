import { Router } from 'express';
import { verifyJWT } from '../middlewares/user.middleware.js';
import { updateCart } from '../controllers/cart.controllers.js';

const cartRouter = Router();

cartRouter.post('/update', verifyJWT, updateCart);

export default cartRouter;
