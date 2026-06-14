import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: [true, 'Please provide a discount amount'],
    min: [0, 'Discount cannot be negative'],
  },
  minOrderAmount: {
    type: Number,
    required: [true, 'Please provide a minimum order amount'],
    min: [0, 'Minimum order amount cannot be negative'],
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  discountType: {
    type: String,
    enum: ['flat', 'percentage'],
    default: 'flat',
  },
  maxDiscountLimit: {
    type: Number,
    default: 0,
  },
  isFirstOrderOnly: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
