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
    enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  courierPartner: {
    type: String,
    default: "",
  },
  trackingNumber: {
    type: String,
    default: "",
  },
  trackingUrl: {
    type: String,
    default: "",
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'CARD'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refund Pending', 'Refunded'],
    default: 'Pending',
  },
  razorpayOrderId: {
    type: String,
    default: "",
  },
  razorpayPaymentId: {
    type: String,
    default: "",
  },
  razorpayRefundId: {
    type: String,
    default: "",
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

delete mongoose.models.Order;
export default mongoose.model('Order', OrderSchema);
