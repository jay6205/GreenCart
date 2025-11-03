import express from 'express';
import { upload } from '../utils/multer.js';
import {
  addProduct,
  changeStock,
  getProductbyId,
  productList,
} from '../controllers/product.controllers.js';
import { authSeller } from '../middlewares/seller.middleware.js';

const productRouter = express.Router();

productRouter.post('/add', upload.array('images'), authSeller, addProduct);
productRouter.get('/list', productList);
productRouter.post('/id', getProductbyId);
productRouter.post('/stock', authSeller, changeStock);

export default productRouter;
