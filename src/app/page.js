"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Products from "../components/Products";
import About from "../components/About";
import Recipes from "../components/Recipes";
import Footer from "../components/Footer";
import QuickViewModal from "../components/QuickViewModal";
import CartDrawer from "../components/CartDrawer";
import AuthModal from "../components/AuthModal";
import ProfileModal from "../components/ProfileModal";
import { Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

// Product Database
const PRODUCTS = [
  // FREEZE-DRIED FRUIT SLICES
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

  // FRUIT POWDERS
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

  // VEGETABLE POWDERS
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

export default function Home() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("slices");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState("addresses");
  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAuthLoading(false);
      }
    };
    
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products from database, falling back to local list:", err);
      }
    };

    checkSession();
    fetchProducts();
  }, []);

  // Load cart on initial mount
  useEffect(() => {
    const storedCart = localStorage.getItem("am_driets_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse stored cart:", e);
      }
    }
  }, []);

  // Add Item to Cart
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      let updatedCart;
      if (existing) {
        updatedCart = prevCart.map((item) => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, quantity }];
      }
      localStorage.setItem("am_driets_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
    setCartOpen(true);
  };

  // Remove Item / Update quantity
  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
      localStorage.setItem("am_driets_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== id);
      localStorage.setItem("am_driets_cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("am_driets_cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Smooth scroll helper using GSAP
  const scrollTo = (elementId) => {
    gsap.to(window, {
      duration: 1.2,
      scrollTo: { y: `#${elementId}`, offsetY: 80 },
      ease: "power3.inOut"
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none antialiased">
      {/* ----------------- TOP PROMO BAR ----------------- */}
      {/* <div className="bg-primary text-white text-xs font-semibold py-2 px-4 text-center z-40 relative flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>100% Natural Freeze-Dried Nutrition • Free Delivery in India on orders over ₹499!</span>
      </div> */}

      <Header 
        cartItemCount={cartItemCount}
        setCartOpen={setCartOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        scrollTo={scrollTo}
        setActiveCategory={setActiveCategory}
        isLoggedIn={isLoggedIn}
        user={user}
        authLoading={authLoading}
        setAuthModalOpen={setAuthModalOpen}
        handleLogout={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          setUser(null);
          setIsLoggedIn(false);
        }}
        setProfileModalOpen={setProfileModalOpen}
        setProfileModalTab={setProfileModalTab}
      />

      <Hero scrollTo={scrollTo} />

      <Features />

      <Products 
        products={products}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        onAddToCart={addToCart}
        onQuickView={setQuickViewProduct}
        clearSearch={() => setSearchQuery("")}
      />

      <About />

      <Recipes scrollTo={scrollTo} />

      <Footer 
        scrollTo={scrollTo}
        setActiveCategory={setActiveCategory}
      />

      <CartDrawer 
        isOpen={cartOpen}
        setIsOpen={setCartOpen}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        cartTotal={cartTotal}
        cartItemCount={cartItemCount}
        clearCart={clearCart}
        isLoggedIn={isLoggedIn}
        setAuthModalOpen={setAuthModalOpen}
      />

      <QuickViewModal 
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
      />

      <AuthModal 
        isOpen={authModalOpen} 
        setIsOpen={setAuthModalOpen} 
        onAuthSuccess={(u) => {
          setUser(u);
          setIsLoggedIn(true);
        }} 
      />

      <ProfileModal 
        isOpen={profileModalOpen}
        setIsOpen={setProfileModalOpen}
        user={user}
        onUpdateUser={setUser}
        initialTab={profileModalTab}
      />
    </div>
  );
}
