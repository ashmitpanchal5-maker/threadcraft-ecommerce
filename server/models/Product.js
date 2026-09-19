const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: String, default: "Anonymous Customer" },
  rating: { type: Number, default: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, default: "T-Shirts" },
    rating: { type: String, default: "5.0" },
    tag: { type: String, default: "NEW DROP" },
    stock: { type: Number, default: 10 },
    desc: { type: String, default: "" },
    image: { type: String, required: true },
    reviews: [reviewSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);