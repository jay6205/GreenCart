import { Router } from 'express';
import { verifyJWT } from '../middlewares/user.middleware.js';
import {
  getAllOrders,
  getUserOrders,
  placeOrderCod,
  placeOrderStripe,
} from '../controllers/order.controllers.js';
import { authSeller } from '../middlewares/seller.middleware.js';

const orderRouter = Router();

orderRouter.post('/cod', verifyJWT, placeOrderCod);
orderRouter.get('/user', verifyJWT, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.post('/stripe', verifyJWT, placeOrderStripe);

export default orderRouter;
