import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
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
  // Pending user data (stored until OTP verified)
  name: { type: String, required: true },
  hashedPassword: { type: String, required: true },

  attempts: { type: Number, default: 0 }, // track wrong attempts
  expiresAt: {
    type: Date,
    required: true,
    // MongoDB TTL index — auto-deletes expired docs
    index: { expires: 0 },
  },
});

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
