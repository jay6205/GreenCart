import Product from '../models/product.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Order from '../models/order.models.js';
import stripe from 'stripe';
import User from '../models/user.models.js';

// /api/order/cod
const placeOrderCod = asyncHandler(async (req, res) => {
  const { items, address } = req.body;
  const userId = req.user._id;
  if (!address || items.length === 0) {
    throw new ApiError(400, 'Bad Request');
  } else {
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // add tax 2%
    amount += parseFloat(amount * 0.02);
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
    });
    return res
      .status(201)
      .json(
        new ApiResponse(201, { order: order }, 'Order placed successfully')
      );
  }
});

// /api/order/user
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);
  const orders = await Order.find({
    userId,
    $or: [{ paymentType: 'COD' }, { isPaid: true }],
  })
    .populate('items.product address')
    .sort({ createdAt: -1 });
  return res
    .status(200)
    .json(
      new ApiResponse(200, { orders: orders }, 'Orders fetched successfully')
    );
});

// /api/order/seller
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [{ paymentType: 'COD' }, { isPaid: true }],
  }).populate('items.product address');
  return res
    .status(200)
    .json(
      new ApiResponse(200, { orders: orders }, 'Orders fetched successfully')
    );
});

// /api/order/stripe
const placeOrderStripe = asyncHandler(async (req, res) => {
  const { items, address } = req.body;
  const userId = req.user._id;
  const { origin } = req.headers;
  if (!address || items.length === 0) {
    throw new ApiError(400, 'Bad Request');
  } else {
    let productData = [];
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // add tax 2%
    amount += parseFloat(amount * 0.02);
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'Online',
    });

    // Stripe Gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe
    const line_items = productData.map((item) => {
      console.log(item.quantity);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { url: session.url }, 'Session created'));
  }
});

//Stripe Webhooks to verify payments Action:/stripe
const stripeWebHooks = asyncHandler(async (req, res) => {
  // Stripe Gateway initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw new ApiError(400, `WebHook error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      // Clear cart data
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { recieved: true }, ' recieved true ig'));
});

export {
  placeOrderCod,
  getUserOrders,
  getAllOrders,
  placeOrderStripe,
  stripeWebHooks,
};
