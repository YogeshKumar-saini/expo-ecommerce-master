import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const verifyDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB for verification...");
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    const products = await Product.find({});
    console.log(`\n📊 Verification Stats:`);
    console.log(`- Total Products in DB: ${products.length}`);

    let cloudinaryImageCount = 0;
    let otherImageCount = 0;
    let missingImagesProductCount = 0;

    products.forEach((product) => {
      if (!product.images || product.images.length === 0) {
        missingImagesProductCount++;
      } else {
        product.images.forEach((img) => {
          if (img.includes("cloudinary.com") || img.includes("res.cloudinary.com")) {
            cloudinaryImageCount++;
          } else {
            otherImageCount++;
          }
        });
      }
    });

    console.log(`- Total Cloudinary Images: ${cloudinaryImageCount}`);
    console.log(`- Total Other/External Images: ${otherImageCount}`);
    console.log(`- Products missing images: ${missingImagesProductCount}`);

    // Fetch categories
    const categories = [...new Set(products.map((p) => p.category))];
    console.log(`- Unique Categories: ${categories.join(", ")}`);

    // Verify first 2 products as sample
    console.log(`\n🔍 Checking Sample Products:`);
    products.slice(0, 2).forEach((p, idx) => {
      console.log(`\n   [Sample ${idx + 1}]`);
      console.log(`   Name:        ${p.name}`);
      console.log(`   Price:       $${p.price}`);
      console.log(`   Category:    ${p.category}`);
      console.log(`   Sizes:       ${p.sizes}`);
      console.log(`   Images:      ${JSON.stringify(p.images, null, 2)}`);
    });

    if (products.length === 52 && otherImageCount === 0 && missingImagesProductCount === 0) {
      console.log(`\n🌟 VERIFICATION RESULT: SUCCESS! All products and Cloudinary connections are perfect!`);
    } else {
      console.warn(`\n⚠️ VERIFICATION RESULT: Potential issues detected. Please check the stats above.`);
    }

  } catch (error) {
    console.error("💥 Verification failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

verifyDatabase();
