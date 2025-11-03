import dotenv from 'dotenv';
import app from './server.js';
import connectdb from './db/index.js';
import connectCloudinary from './utils/cloudinary.js';
dotenv.config();
import mongoose from 'mongoose';

const port = process.env.EXPRESS_PORT || 8000;

connectdb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('MONGODB connection issue', err);
    process.exit(1);
  });

connectCloudinary();
