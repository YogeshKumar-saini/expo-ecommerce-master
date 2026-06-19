import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const MAX_PRODUCTS = 50; // Insert only a reasonable number for testing
const productsToInsert = [];

const fallbackImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500", // generic fashion
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500",
  "https://images.unsplash.com/photo-1529139574466-a303027c028b?w=500",
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500",
];

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.DB_URL);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("DB connection error:", error.message);
    process.exit(1);
  }
};

const getRandomImage = () => {
  const index = Math.floor(Math.random() * fallbackImages.length);
  return fallbackImages[index];
};

const runSeed = async () => {
  await connectDB();

  console.log("Clearing existing products...");
  await Product.deleteMany({});

  console.log("Reading CSV data...");
  let count = 0;

  fs.createReadStream("/home/yogesh/Desktop/hacktron/expo-ecommerce-master/FashionDataset.csv")
    .pipe(csv())
    .on("data", (row) => {
      // Limit the number of products to prevent huge database loading 
      if (count >= MAX_PRODUCTS) return;

      const brand = row.BrandName ? row.BrandName.charAt(0).toUpperCase() + row.BrandName.slice(1) : "Unknown Brand";
      const details = row.Deatils || "Fashion Item";
      
      const priceRaw = String(row.SellPrice || row.MRP || "0").replace(/[^0-9.]/g, "");
      const price = parseFloat(priceRaw) || 999;
      
      const stock = Math.floor(Math.random() * 50) + 10;
      
      productsToInsert.push({
        name: `${brand} - ${details.substring(0, 100)}`,
        description: `${details}. ${row.Sizes ? 'Sizes: ' + row.Sizes : ''}.`,
        price: price,
        stock: stock,
        category: row.Category || "Fashion",
        images: [getRandomImage(), getRandomImage()],
        
        // Literal CSV column mappings with unique ID
        csvId: count, // Unique ID from row index
        brandName: row.BrandName || "",
        details: row.Deatils || "",
        sizes: row.Sizes || "",
        mrp: row.MRP || "",
        sellPrice: parseFloat(row.SellPrice) || price,
        discount: row.Discount || ""
      });

      count++;
    })
    .on("end", async () => {
      try {
        console.log(`Inserting ${productsToInsert.length} products to the database...`);
        if (productsToInsert.length > 0) {
          await Product.insertMany(productsToInsert);
          console.log("✅ Successfully seeded products from CSV!");
        } else {
          console.log("No data extracted from CSV.");
        }
      } catch (error) {
        console.error("Error inserting products:", error);
      } finally {
        mongoose.connection.close();
      }
    })
    .on("error", (error) => {
      console.error("Error processing CSV:", error);
      mongoose.connection.close();
    });
};

runSeed();