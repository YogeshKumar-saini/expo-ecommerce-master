import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // API Contract Fields (Used by frontend & controllers)
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    // CSV Dataset Specific Fields
    csvId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    brandName: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    sizes: {
      type: String,
      default: "",
    },
    mrp: {
      type: String,
      default: "",
    },
    sellPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
