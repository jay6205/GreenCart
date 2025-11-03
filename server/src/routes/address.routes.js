import { Router } from 'express';
import { verifyJWT } from '../middlewares/user.middleware.js';
import { addAddress, getAddress } from '../controllers/address.controllers.js';

const addressRouter = Router();

addressRouter.post('/add', verifyJWT, addAddress);
addressRouter.get('/get', verifyJWT, getAddress);

export default addressRouter;
