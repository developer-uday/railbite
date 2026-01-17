import mongoose from "mongoose";
import { generateOrderId } from "../utils/counterUtils.js";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    customer: {
      name: { type: String, required: true },
      phone: String,
      email: { type: String, required: true },
    },

    journey: {
      trainNo: String,
      doj: Date, // date of journey
      pnr: String, // PNR/booking reference
      seat: String,
      coach: String,
      station: String,
    },

    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
        name: String,
        price: Number,
        quantity: { type: Number, required: true },
      },
    ],

    pricing: {
      subtotal: Number,
      deliveryFee: { type: Number, default: 20 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "PREPAID"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "UNPAID", "PAID", "FAILED"],
      default: "PENDING",
    },

    orderStatus: {
      type: String,
      enum: [
        "NEW",
        "ACKNOWLEDGED",
        "PREPARING",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "DECLINED",
        "CANCELLED",
      ],
      default: "NEW",
    },

    notes: String,

    deliveryDate: Date, // When the food will be delivered (estimated or user-provided)

    declineReason: String,

    deliveredAt: Date,

    refundedAmount: Number,

    refundedAt: Date,
  },
  { timestamps: true }
);

// Auto-generate sequential orderId before validation
// Use async/promise-style middleware (no `next` callback) so Mongoose
// awaits the promise and we don't call an undefined `next`.
orderSchema.pre("validate", async function () {
  if (!this.orderId) {
    this.orderId = await generateOrderId();
  }
});

export default mongoose.model("Order", orderSchema);