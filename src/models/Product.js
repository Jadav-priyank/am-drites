import mongoose from 'mongoose';

const NutritionSchema = new mongoose.Schema({
  calories: String,
  carbs: String,
  sugar: String,
  protein: String,
  fat: String
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['slices', 'powders', 'vegetables']
  },
  price: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  reviews: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  ingredients: {
    type: String,
    required: true
  },
  nutrition: NutritionSchema,
  tag: String,
  bgGradient: String,
  imageFront: String,
  imageBack: String,
  stockQuantity: {
    type: Number,
    default: 50
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

delete mongoose.models.Product;
export default mongoose.model('Product', ProductSchema);
