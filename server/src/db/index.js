import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(':) ✅ MONGODB connected');
  } catch (error) {
    console.error(':( ❌MongoDB connection issue', error);
    process.exit(1);
  }
};

export default connectdb;
