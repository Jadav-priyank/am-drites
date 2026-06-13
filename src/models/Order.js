import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  price: Number,
  quantity: Number,
  size: String,
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Completed',
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'CARD'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
