import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to escape CSV values
const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return "";
  let str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const exportToCsv = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    console.log("📦 Fetching all products...");
    const products = await Product.find({});
    console.log(`📋 Found ${products.length} products to export`);

    // Define CSV Headers
    const headers = [
      "_id",
      "name",
      "description",
      "price",
      "stock",
      "category",
      "images",
      "averageRating",
      "totalReviews",
      "sizes",
      "isActive",
      "isFeatured",
    ];

    let csvContent = headers.join(",") + "\n";

    products.forEach((p) => {
      const row = [
        p._id.toString(),
        p.name,
        p.description,
        p.price,
        p.stock,
        p.category,
        // Join multiple image URLs with semicolon so it doesn't break CSV comma separation
        p.images ? p.images.join(";") : "",
        p.averageRating,
        p.totalReviews,
        p.sizes || "",
        p.isActive !== undefined ? p.isActive : true,
        p.isFeatured !== undefined ? p.isFeatured : false,
      ];

      csvContent += row.map(escapeCsvValue).join(",") + "\n";
    });

    const outputPath = path.resolve(__dirname, "../../../products_cloudinary.csv");
    fs.writeFileSync(outputPath, csvContent, "utf8");
    console.log(`\n🎉 CSV File created successfully!`);
    console.log(`📁 File location: ${outputPath}`);

  } catch (error) {
    console.error("💥 Export failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

exportToCsv();
