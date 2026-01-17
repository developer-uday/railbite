import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
    },

    station: {
      type: String,
      required: true,
    },

    cuisineType: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      default: null,
    },

    // Station & Delivery Info
    distanceFromStation: {
      type: Number, // in KM
      required: true,
    },

    minPreparationTime: {
      type: Number, // in minutes
      default: 20,
    },

    // Payment
    paymentMode: {
      type: String,
      enum: ["COD", "PREPAID"],
      default: "COD",
    },

    // Operating Hours (24-hour format)
    operatingHours: {
      open: {
        type: String, // HH:mm
        required: true,
      },
      close: {
        type: String, // HH:mm
        required: true,
      },
    },

    // Break Time
    breakTime: {
      from: {
        type: String, // HH:mm
      },
      to: {
        type: String, // HH:mm
      },
    },

    // Temporary Closure (date-based)
    temporaryClosure: {
      from: {
        type: Date, // DD-MM-YYYY HH:mm
      },
      to: {
        type: Date, // DD-MM-YYYY HH:mm
      },
    },

    // Ratings (optional, but good for demo)
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean, // Admin approval
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
