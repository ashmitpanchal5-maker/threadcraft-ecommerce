const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/Product");

const INITIAL_PRODUCTS = [
  {
    name: "Noir Heavyweight Oversized Tee",
    price: 899,
    originalPrice: 1499,
    category: "T-Shirts",
    rating: "4.9",
    tag: "BESTSELLER",
    stock: 12,
    desc: "240 GSM heavy combed bio-washed cotton with luxury dropped shoulders and ribbed crew neck.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    reviews: [{ user: "Rahul S.", rating: 5, comment: "Pure heavyweight fabric, drop-shoulder look is incredible." }]
  },
  {
    name: "Vintage Distressed Denim Jacket",
    price: 2699,
    originalPrice: 3999,
    category: "Jackets",
    rating: "4.8",
    tag: "TRENDING",
    stock: 5,
    desc: "14oz authentic vintage washed indigo denim with brushed antique metal buttons.",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
    reviews: [{ user: "Aman V.", rating: 5, comment: "Heavy quality denim and accurate sizing." }]
  },
  {
    name: "Tactical Utility Cargo Joggers",
    price: 1599,
    originalPrice: 2299,
    category: "Bottoms",
    rating: "4.7",
    tag: "POPULAR",
    stock: 8,
    desc: "Reinforced 6-pocket cargo pants with adjustable ankles and breathable stretch cotton.",
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80",
    reviews: []
  },
  {
    name: "Monochrome Minimalist Fleece Hoodie",
    price: 1999,
    originalPrice: 2999,
    category: "Hoodies",
    rating: "5.0",
    tag: "WINTER ESSENTIAL",
    stock: 3,
    desc: "380 GSM thermal brushed fleece with structured double-layered hood and front pouch.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    reviews: []
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(INITIAL_PRODUCTS);
    console.log("✓ Initial products seeded successfully into MongoDB Atlas!");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedDB();