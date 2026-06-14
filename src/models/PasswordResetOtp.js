import mongoose from 'mongoose';

const PasswordResetOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: { type: Number, default: 0 },
  expiresAt: {
    type: Date,
    required: true,
    // MongoDB TTL index — auto-deletes expired docs
    index: { expires: 0 },
  },
});

export default mongoose.models.PasswordResetOtp ||
  mongoose.model('PasswordResetOtp', PasswordResetOtpSchema);
