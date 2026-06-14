import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';

const SEED_PRODUCTS = [
  {
    id: "slices-mango",
    name: "Freeze-Dried Mango Slices",
    category: "slices",
    price: 299,
    rating: 4.9,
    reviews: 124,
    description: "Premium Alphonso mango slices freeze-dried to crunchy perfection. Naturally sweet, melting in your mouth with intense tropical flavor.",
    size: "50g",
    ingredients: "100% Alphonso Mango",
    nutrition: { calories: "180 kcal", carbs: "42g", sugar: "36g (Natural)", protein: "1.5g", fat: "0g" },
    tag: "Best Seller",
    bgGradient: "from-amber-100 to-orange-100",
    imageFront: "/mangoSliceFront.png",
    imageBack: "/mangoSliceBack.png"
  },
  {
    id: "slices-strawberry",
    name: "Freeze-Dried Strawberry Slices",
    category: "slices",
    price: 299,
    rating: 4.8,
    reviews: 98,
    description: "Plump, handpicked strawberries sliced and freeze-dried. A delightful tart-sweet crunch that bursts with fresh berry flavor.",
    size: "40g",
    ingredients: "100% Fresh Strawberries",
    nutrition: { calories: "140 kcal", carbs: "32g", sugar: "24g (Natural)", protein: "2.8g", fat: "0.4g" },
    tag: "100% Natural",
    bgGradient: "from-rose-50 to-red-100",
    imageFront: "/strawberrySliceFront.jpg",
    imageBack: "/strawberrySliceBack.jpg"
  },
  {
    id: "slices-banana",
    name: "Freeze-Dried Banana Slices",
    category: "slices",
    price: 199,
    rating: 4.7,
    reviews: 86,
    description: "Sweet, creamy Robusta bananas sliced and dried. Packed with natural potassium, offering a crisp, satisfying healthy snack.",
    size: "60g",
    ingredients: "100% Premium Bananas",
    nutrition: { calories: "220 kcal", carbs: "53g", sugar: "29g (Natural)", protein: "2.5g", fat: "0.2g" },
    tag: "Kids Favorite",
    bgGradient: "from-yellow-50 to-amber-100",
    imageFront: "/bananaSliceFront.jpg",
    imageBack: "/bananaSliceBack.jpg"
  },
  {
    id: "slices-apple",
    name: "Freeze-Dried Apple Slices",
    category: "slices",
    price: 220,
    rating: 4.6,
    reviews: 54,
    description: "Crisp, sweet Himalayan apple slices. Freeze-dried to lock in that fresh autumn flavor, fiber, and antioxidant benefits.",
    size: "50g",
    ingredients: "100% Red Delicious Apples",
    nutrition: { calories: "175 kcal", carbs: "44g", sugar: "32g (Natural)", protein: "0.8g", fat: "0.2g" },
    tag: "Fiber Rich",
    bgGradient: "from-red-50 to-orange-50",
    imageFront: "/appleSliceFront.jpg",
    imageBack: "/appleSliceBack.png"
  },
  {
    id: "slices-kiwi",
    name: "Freeze-Dried Kiwi Slices",
    category: "slices",
    price: 279,
    rating: 4.7,
    reviews: 42,
    description: "Tangy and refreshing kiwi fruit slices with their signature seeds. Vitamin C powerhouse in a crunchy, exotic snack format.",
    size: "40g",
    ingredients: "100% Organic Kiwi",
    nutrition: { calories: "150 kcal", carbs: "35g", sugar: "26g (Natural)", protein: "2.1g", fat: "0.8g" },
    tag: "Vit C Rich",
    bgGradient: "from-emerald-50 to-green-100",
    imageFront: "/kiwiSliceFront.jpg",
    imageBack: "/kiwiSliceBack.jpg"
  },
  {
    id: "slices-pineapple",
    name: "Freeze-Dried Pineapple Slices",
    category: "slices",
    price: 260,
    rating: 4.8,
    reviews: 67,
    description: "Tangy-sweet, golden pineapple wedges freeze-dried to preserve their juicy essence and digestive bromelain enzymes.",
    size: "50g",
    ingredients: "100% Smooth Cayenne Pineapple",
    nutrition: { calories: "165 kcal", carbs: "40g", sugar: "31g (Natural)", protein: "1.2g", fat: "0.1g" },
    tag: "Digestive Aid",
    bgGradient: "from-yellow-100 to-yellow-50",
    imageFront: "/pineappleSliceFrozenFront.jpg",
    imageBack: "/pineappleSliceBack.jpg"
  },
  {
    id: "powder-mango",
    name: "Premium Mango Powder",
    category: "powders",
    price: 349,
    rating: 4.9,
    reviews: 89,
    description: "100% pure mango powder made from freeze-dried Alphonso mangoes. Perfect for desserts, smoothies, baking, and yogurt bowls.",
    size: "100g",
    ingredients: "100% Freeze-Dried Mango",
    nutrition: { calories: "360 kcal", carbs: "84g", sugar: "72g (Natural)", protein: "3g", fat: "0g" },
    tag: "Baking Essential",
    bgGradient: "from-amber-100 to-yellow-100",
    imageFront: "/mangoPowderFront.jpg",
    imageBack: "/mangoPowderBack.jpg"
  },
  {
    id: "powder-strawberry",
    name: "Premium Strawberry Powder",
    category: "powders",
    price: 399,
    rating: 4.8,
    reviews: 73,
    description: "Rich, vibrant pink strawberry powder. Dissolves easily, adding a fresh, intense berry kick to milkshakes, icing, and smoothies.",
    size: "100g",
    ingredients: "100% Freeze-Dried Strawberries",
    nutrition: { calories: "280 kcal", carbs: "64g", sugar: "48g (Natural)", protein: "5.6g", fat: "0.8g" },
    tag: "Superfood",
    bgGradient: "from-rose-100 to-pink-50",
    imageFront: "/strawberryPowderFront.jpg",
    imageBack: null
  },
  {
    id: "powder-banana",
    name: "Premium Banana Powder",
    category: "powders",
    price: 249,
    rating: 4.6,
    reviews: 41,
    description: "Creamy banana powder retaining all raw potassium and carbohydrates. Excellent natural sweetener for baby foods and pre-workout shakes.",
    size: "150g",
    ingredients: "100% Freeze-Dried Banana",
    nutrition: { calories: "440 kcal", carbs: "106g", sugar: "58g (Natural)", protein: "5g", fat: "0.4g" },
    tag: "Fitness Favorite",
    bgGradient: "from-yellow-100 to-amber-50",
    imageFront: "/bananaPowderFront.jpg",
    imageBack: "/bananaPowderBack.jpg"
  },
  {
    id: "powder-apple",
    name: "Premium Apple Powder",
    category: "powders",
    price: 279,
    rating: 4.5,
    reviews: 29,
    description: "Vibrant apple powder with a sweet, concentrated taste. Ideal for naturally sweetening oatmeal, porridge, and healthy pastries.",
    size: "120g",
    ingredients: "100% Freeze-Dried Apples",
    nutrition: { calories: "350 kcal", carbs: "88g", sugar: "64g (Natural)", protein: "1.6g", fat: "0.4g" },
    tag: "All-Natural Sweetener",
    bgGradient: "from-red-100 to-orange-50",
    imageFront: "/applePowderFront.jpg",
    imageBack: "/applePowderBack.jpg"
  },
  {
    id: "powder-kiwi",
    name: "Premium Kiwi Powder",
    category: "powders",
    price: 399,
    rating: 4.7,
    reviews: 18,
    description: "Bright green, zesty kiwi powder. Adds a refreshing tang, brilliant natural color, and enzyme boost to juices, mocktails, and marinades.",
    size: "100g",
    ingredients: "100% Freeze-Dried Kiwi",
    nutrition: { calories: "300 kcal", carbs: "70g", sugar: "52g (Natural)", protein: "4.2g", fat: "1.6g" },
    tag: "Color Booster",
    bgGradient: "from-green-100 to-emerald-50",
    imageFront: "/kiwiPowderFront.jpg",
    imageBack: null
  },
  {
    id: "powder-pineapple",
    name: "Premium Pineapple Powder",
    category: "powders",
    price: 329,
    rating: 4.7,
    reviews: 35,
    description: "Fine golden pineapple powder. Imparts a sweet, tropical aroma and flavor to frostings, mocktails, baking mixes, and dry rubs.",
    size: "100g",
    ingredients: "100% Freeze-Dried Pineapple",
    nutrition: { calories: "330 kcal", carbs: "80g", sugar: "62g (Natural)", protein: "2.4g", fat: "0.2g" },
    tag: "Tropical Flavor",
    bgGradient: "from-yellow-50 to-orange-100",
    imageFront: "/pineapplePowderFront.jpg",
    imageBack: "/pineapplePowderBack.jpg"
  },
  {
    id: "powder-beetroot",
    name: "Premium Beetroot Powder",
    category: "vegetables",
    price: 249,
    rating: 4.9,
    reviews: 112,
    description: "Nutritious, deep ruby beetroot powder. Highly versatile for adding natural red color and a sweet earthy flavor to rotis, smoothies, and soups.",
    size: "120g",
    ingredients: "100% Freeze-Dried Beetroot",
    nutrition: { calories: "340 kcal", carbs: "72g", sugar: "54g (Natural)", protein: "12g", fat: "0.5g" },
    tag: "Pre-Workout Boost",
    bgGradient: "from-rose-100 to-purple-100",
    imageFront: "/beetrootPowderFront.jpg",
    imageBack: null
  },
  {
    id: "powder-tomato",
    name: "Premium Tomato Powder",
    category: "vegetables",
    price: 199,
    rating: 4.6,
    reviews: 64,
    description: "Concentrated tomato powder bursting with fresh, savory umami taste. Adds flavor to instant soups, sauces, seasonings, and chips.",
    size: "100g",
    ingredients: "100% Freeze-Dried Tomato",
    nutrition: { calories: "302 kcal", carbs: "58g", sugar: "34g (Natural)", protein: "14g", fat: "1.5g" },
    tag: "Umami Rich",
    bgGradient: "from-red-100 to-orange-100",
    imageFront: "/tomatoPowderFront.jpg",
    imageBack: null
  },
  {
    id: "powder-onion",
    name: "Premium Onion Powder",
    category: "vegetables",
    price: 149,
    rating: 4.7,
    reviews: 58,
    description: "Pure, intense onion powder made from freeze-dried Indian onions. Easy to blend, no tears, perfect for dry rubs, sauces, and marinades.",
    size: "100g",
    ingredients: "100% Freeze-Dried Onion",
    nutrition: { calories: "347 kcal", carbs: "80g", sugar: "26g (Natural)", protein: "10g", fat: "0.8g" },
    tag: "Kitchen Essential",
    bgGradient: "from-amber-50 to-stone-100",
    imageFront: "/onionPowderFront.jpg",
    imageBack: null
  }
];

export async function GET() {
  try {
    await connectToDatabase();
    
    // Check if products exist in db
    let products = await Product.find({}).sort({ createdAt: -1 });
    
    if (!products || products.length === 0) {
      console.log("No products found in DB. Seeding...");
      await Product.insertMany(SEED_PRODUCTS);
      products = await Product.find({}).sort({ createdAt: -1 });
    }
    
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error('Fetch/Seed Products Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
