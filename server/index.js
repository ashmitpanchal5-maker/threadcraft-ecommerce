const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (File upload payload size support ke liye limit 10mb)
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// MongoDB Connection URI
// Agar aapke paas Atlas string hai toh wahan replace karein, ya default local MongoDB chalega:
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/threadcraft";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✓ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// --- API ROUTES ---

// 1. Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 2. Add new product (Admin)
app.post("/api/products", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Delete product (Admin)
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Add review to product
app.post("/api/products/:id/review", async (req, res) => {
  try {
    const { user, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.reviews.push({ user, rating: Number(rating), comment });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Get all customer orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// 6. Create new customer order (and decrement stock)
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body;
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Auto decrement stock
    for (const item of orderData.items) {
      if (item._id || item.id) {
        const prodId = item._id || item.id;
        await Product.findByIdAndUpdate(prodId, {
          $inc: { stock: -item.qty }
        });
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ ThreadCraft API Server running on http://localhost:${PORT}`);
});