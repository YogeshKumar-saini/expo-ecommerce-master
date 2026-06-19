import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory where local images are located
const LOCAL_IMAGES_DIR = path.resolve(__dirname, "../../../assets/products-images");

const uploadImages = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    console.log("📦 Fetching all products...");
    const products = await Product.find({});
    console.log(`📋 Found ${products.length} products to process`);

    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n🔄 [${i + 1}/${products.length}] Processing product: "${product.name}" (ID: ${product._id})`);

      const updatedImages = [];
      let productUpdated = false;

      for (let j = 0; j < product.images.length; j++) {
        const imagePath = product.images[j];

        // 1. Skip if already a Cloudinary URL
        if (imagePath.includes("res.cloudinary.com") || imagePath.includes("cloudinary.com")) {
          console.log(`   - Image [${j + 1}]: Already on Cloudinary, skipping: ${imagePath}`);
          updatedImages.push(imagePath);
          totalSkipped++;
          continue;
        }

        try {
          let uploadResult;

          // 2. Handle remote URL
          if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            console.log(`   - Image [${j + 1}]: Uploading remote URL to Cloudinary...`);
            uploadResult = await cloudinary.uploader.upload(imagePath, {
              folder: "products",
            });
          } else {
            // 3. Handle local path
            // Extract filename if it includes path separators
            const filename = path.basename(imagePath);
            const absoluteLocalPath = path.join(LOCAL_IMAGES_DIR, filename);

            if (fs.existsSync(absoluteLocalPath)) {
              console.log(`   - Image [${j + 1}]: Uploading local file to Cloudinary: ${filename}`);
              uploadResult = await cloudinary.uploader.upload(absoluteLocalPath, {
                folder: "products",
              });
            } else {
              console.warn(`   - Image [${j + 1}]: Local file does not exist: ${absoluteLocalPath}`);
              updatedImages.push(imagePath); // keep original fallback
              continue;
            }
          }

          if (uploadResult && uploadResult.secure_url) {
            console.log(`     ✅ Uploaded! Cloudinary URL: ${uploadResult.secure_url}`);
            updatedImages.push(uploadResult.secure_url);
            totalUploaded++;
            productUpdated = true;
          } else {
            throw new Error("Cloudinary did not return a secure_url");
          }
        } catch (uploadError) {
          console.error(`     ❌ Failed to upload image: ${imagePath}`, uploadError.message);
          updatedImages.push(imagePath); // keep original on error
          totalFailed++;
        }
      }

      // If any image was uploaded, update the product in MongoDB
      if (productUpdated) {
        product.images = updatedImages;
        await product.save();
        console.log(`   💾 Product updated in MongoDB!`);
      } else {
        console.log(`   ℹ️ No changes made to product.`);
      }
    }

    console.log("\n📊 Upload Process Summary:");
    console.log(`- Total Images Uploaded: ${totalUploaded}`);
    console.log(`- Total Images Skipped: ${totalSkipped}`);
    console.log(`- Total Images Failed: ${totalFailed}`);

  } catch (error) {
    console.error("💥 Script execution failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

uploadImages();
