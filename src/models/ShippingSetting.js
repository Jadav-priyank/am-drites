import mongoose from 'mongoose';

const ShippingSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'default_shipping_rules',
    unique: true,
  },
  freeShippingThreshold: {
    type: Number,
    required: true,
    default: 499,
    min: [0, 'Threshold cannot be negative'],
  },
  percentageCharge: {
    type: Number,
    required: true,
    default: 10,
    min: [0, 'Percentage charge cannot be negative'],
    max: [100, 'Percentage charge cannot exceed 100%'],
  },
  minShippingCharge: {
    type: Number,
    required: true,
    default: 50,
    min: [0, 'Minimum charge cannot be negative'],
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ShippingSetting || mongoose.model('ShippingSetting', ShippingSettingSchema);
