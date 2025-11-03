import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import Product from '../models/product.models.js';

// /api/product/add
const addProduct = asyncHandler(async (req, res) => {
  let productData = JSON.parse(req.body.productData);
  if (!productData) {
    throw new ApiError(400, 'Bad Request');
  }
  const images = req.files;
  let imagesURL = await Promise.all(
    images.map(async (item) => {
      let result = await cloudinary.uploader.upload(item.path, {
        resource_type: 'image',
      });
      return result.secure_url;
    })
  );
  await Product.create({ ...productData, image: imagesURL });
  return res.status(201).json(new ApiResponse(201, {}, 'Product Added'));
});

// /api/product/list
const productList = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products: products },
        products.length === 0
          ? 'No products found'
          : 'Products fetched properly'
      )
    );
});

// /api/product/id
const getProductbyId = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, { product: product }, 'Product Fetched'));
  }
});

// /api/product/stock
const changeStock = asyncHandler(async (req, res) => {
  const { id, inStock } = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { inStock },
    { new: true }
  );

  if (!updatedProduct) {
    throw new ApiError(404, 'Product not found');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: updatedProduct },
        'Stock updated successfully'
      )
    );
});

export { addProduct, productList, getProductbyId, changeStock };
