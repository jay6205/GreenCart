import mongoose, { Schema } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'product',
        },
        quantity: { type: Number, required: true },
      },
    ],

    amount: { type: Number, required: true },

    address: { type: Schema.Types.ObjectId, required: true, ref: 'address' },

    status: { type: String, required: true, default: 'Order Placed' },

    paymentType: { type: String, required: true },

    isPaid: { type: Boolean, required: true, default: false },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
