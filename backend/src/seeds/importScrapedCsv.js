import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import csvParser from "csv-parser";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.resolve(__dirname, "../../../scraped_products_with_subcategories.csv");
const BATCH_SIZE = 1000;

const importCsvToDb = async () => {
  try {
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`❌ CSV file not found at: ${CSV_PATH}`);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️ Clearing existing products collection...");
    await Product.deleteMany({});
    console.log("🗑️ Cleared existing products");

    console.log("📦 Reading CSV and preparing bulk insert...");

    let bulkOps = [];
    let count = 0;

    const stream = fs.createReadStream(CSV_PATH).pipe(csvParser());

    for await (const row of stream) {
      // Map and sanitize CSV row to Mongoose schema
      const mappedProduct = {
        name: row.name,
        description: row.description,
        price: parseFloat(row.price) || 0,
        stock: parseInt(row.stock, 10) || 100,
        category: row.category,
        subcategory: row.subcategory,
        images: row.images ? row.images.split(";").filter(Boolean) : [],
        averageRating: parseFloat(row.averageRating) || 0,
        totalReviews: parseInt(row.totalReviews, 10) || 0,
        sizes: row.sizes || "",
        isActive: row.isActive === "true" || row.isActive === true,
        isFeatured: row.isFeatured === "true" || row.isFeatured === true,
      };

      bulkOps.push({
        insertOne: {
          document: mappedProduct,
        },
      });

      count++;

      // Batch write to database
      if (bulkOps.length >= BATCH_SIZE) {
        process.stdout.write(`⏳ Inserting batch (Total processed: ${count})...\r`);
        await Product.bulkWrite(bulkOps);
        bulkOps = [];
      }
    }

    // Write remaining records
    if (bulkOps.length > 0) {
      console.log(`\n⏳ Inserting final batch of ${bulkOps.length} items...`);
      await Product.bulkWrite(bulkOps);
    }

    console.log(`\n🎉 CSV Import complete! Successfully inserted ${count} products into MongoDB.`);

  } catch (error) {
    console.error("💥 Import failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

importCsvToDb();
