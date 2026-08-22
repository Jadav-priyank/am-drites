import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    codEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
