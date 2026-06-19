import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedProductsFromTS = async () => {
  try {
    console.log("📂 Reading seedProducts.ts...");
    const tsPath = path.join(__dirname, "../../../assets/scripts/seedProducts.ts");
    const tsContent = fs.readFileSync(tsPath, "utf8");

    // Extract the PRODUCTS array string
    const startIdx = tsContent.indexOf("const PRODUCTS = [");
    if (startIdx === -1) {
      throw new Error("❌ PRODUCTS array not found in seedProducts.ts");
    }

    const endIdx = tsContent.indexOf("export const seedProducts");
    if (endIdx === -1) {
      throw new Error("❌ export const seedProducts not found in seedProducts.ts");
    }

    // Extract characters representing the array: [ ... ]
    let productsString = tsContent.substring(startIdx + "const PRODUCTS = ".length, endIdx).trim();
    if (productsString.endsWith(";")) {
      productsString = productsString.slice(0, -1);
    }

    // Evaluate the array string to construct a JavaScript array
    // Since it's a static TS/JS array file, eval is safe and simple here
    const PRODUCTS = eval(productsString);
    console.log(`✅ Loaded ${PRODUCTS.length} products from seedProducts.ts`);

    // Map properties to match product schema
    const mappedProducts = PRODUCTS.map((p) => ({
      _id: p._id ? new mongoose.Types.ObjectId(p._id) : undefined,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock !== undefined ? p.stock : 100,
      category: p.category,
      images: p.images || [],
      averageRating: p.ratings?.average || 0,
      totalReviews: p.ratings?.count || 0,
      sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || ""),
      isActive: p.isActive !== undefined ? p.isActive : true,
      isFeatured: p.isFeatured !== undefined ? p.isFeatured : false,
    }));

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    console.log("📦 Syncing products to database...");
    let insertedCount = 0;
    let updatedCount = 0;

    for (const mappedProduct of mappedProducts) {
      if (mappedProduct._id) {
        const existingProduct = await Product.findById(mappedProduct._id);
        if (existingProduct) {
          // If the product exists and has Cloudinary URLs already, preserve them
          const hasCloudinary = existingProduct.images.some(
            (img) => img.includes("cloudinary.com") || img.includes("res.cloudinary.com")
          );
          if (hasCloudinary) {
            mappedProduct.images = existingProduct.images;
          }
          await Product.findByIdAndUpdate(mappedProduct._id, mappedProduct);
          updatedCount++;
        } else {
          await Product.create(mappedProduct);
          insertedCount++;
        }
      } else {
        await Product.create(mappedProduct);
        insertedCount++;
      }
    }
    console.log(`🎉 Sync completed! Created: ${insertedCount}, Updated: ${updatedCount}`);

    const categories = [...new Set(mappedProducts.map((p) => p.category))];
    console.log("\n📊 Seeding Summary:");
    console.log(`- Total Seeding Count: ${mappedProducts.length}`);
    console.log(`- Categories: ${categories.join(", ")}`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

seedProductsFromTS();
