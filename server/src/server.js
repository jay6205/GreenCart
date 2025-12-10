import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from "./utils/passport-config.js"

const app = express();
const port = process.env.PORT || 4000;

app.set('trust proxy', 1);

// basic configurations
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use(cookieParser());

// cors configurations
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(
          new Error(`CORS error: Origin ${origin} not allowed by CORS`),
          false
        );
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Date', 'Connection'],
    optionsSuccessStatus: 204,
  })
);

// healthcheck routes
import healthCheckRouter from './routes/healthcheck.routes.js';
app.use('/api/healthcheck', healthCheckRouter);

// Google Login routes
app.use(passport.initialize())

// user routes
import userRouter from './routes/user.routes.js';
app.use('/api/user', userRouter);

// seller routes
import sellerRouter from './routes/seller.routes.js';
app.use('/api/seller', sellerRouter);

// product routes
import productRouter from './routes/product.routes.js';
app.use('/api/product', productRouter);

// cart routes
import cartRouter from './routes/cart.routes.js';
app.use('/api/cart', cartRouter);

// address routes
import addressRouter from './routes/address.routes.js';
app.use('/api/address', addressRouter);

// address routes
import orderRouter from './routes/order.routes.js';
import mongoose from 'mongoose';
import { stripeWebHooks } from './controllers/order.controllers.js';
app.use('/api/order', orderRouter);

app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebHooks);

app.get('/', (req, res) => {
  res.send('Home');
});

export default app;
