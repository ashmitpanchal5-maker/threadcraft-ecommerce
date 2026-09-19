const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    items: { type: Array, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, default: "" },
    address: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      pincode: String
    },
    status: { type: String, default: "Confirmed" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);