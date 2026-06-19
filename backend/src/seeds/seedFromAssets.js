import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product images directory - at root level
const IMAGES_DIR = path.join(__dirname, "../../../assets/products-images");

// Get all product images
const getProductImages = () => {
  const files = fs.readdirSync(IMAGES_DIR).filter((file) => file.endsWith(".png"));
  return files.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });
};

// Group images for each product (some products have multiple variants)
const groupProductImages = (images) => {
  const grouped = {};

  images.forEach((img) => {
    // Extract base number (e.g., "p_img2" from "p_img2_1.png" or "p_img2.png")
    const match = img.match(/p_img(\d+)(?:_\d)?/);
    if (match) {
      const baseNum = match[1];
      if (!grouped[baseNum]) {
        grouped[baseNum] = [];
      }
      grouped[baseNum].push(`/assets/products-images/${img}`);
    }
  });

  return Object.values(grouped);
};

// Sample product templates
const productTemplates = [
  {
    name: "Classic Cotton T-Shirt",
    description: "Premium quality cotton t-shirt, perfect for everyday wear. Comfortable fit and durable fabric.",
    price: 45,
    category: "Men",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Women's Cotton Top",
    description: "Lightweight cotton top designed for comfort and style. Perfect for casual wear.",
    price: 35,
    category: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Men's Casual Trousers",
    description: "Comfortable flat-front trousers suitable for casual and semi-formal occasions.",
    price: 65,
    category: "Men",
    sizes: ["30", "32", "34", "36", "38"],
  },
  {
    name: "Women's Casual Dress",
    description: "Elegant casual dress perfect for day or evening outings.",
    price: 55,
    category: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    name: "Men's Casual Shirt",
    description: "Quality casual shirt with a modern cut and comfortable fit.",
    price: 50,
    category: "Men",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ DB connection error:", error.message);
    process.exit(1);
  }
};

const seedProductsFromAssets = async () => {
  await connectDB();

  console.log("🗑️  Clearing existing products...");
  await Product.deleteMany({});

  console.log("📂 Reading product images from assets...");
  const images = getProductImages();
  const groupedImages = groupProductImages(images);

  console.log(`🖼️  Found ${groupedImages.length} product image groups`);

  const productsToInsert = [];
  let csvId = 1;

  groupedImages.forEach((imageGroup, index) => {
    const template = productTemplates[index % productTemplates.length];
    const stock = Math.floor(Math.random() * 80) + 20;

    productsToInsert.push({
      csvId: csvId++,
      name: `${template.name} - Variant ${index + 1}`,
      description: template.description,
      price: template.price + Math.floor(Math.random() * 30),
      stock: stock,
      category: template.category,
      images: imageGroup,
      sizes: template.sizes,
      averageRating: Math.random() * 5,
      totalReviews: Math.floor(Math.random() * 100),
      // CSV Fields (empty for local assets version)
      brandName: "Premium Collection",
      details: template.description,
      sizes: template.sizes.join(", "),
      mrp: `Rs ${(template.price * 1.5).toFixed(0)}`,
      sellPrice: template.price,
      discount: `${Math.floor(Math.random() * 30) + 10}% off`,
    });
  });

  try {
    console.log(`\n📦 Inserting ${productsToInsert.length} products to the database...`);
    if (productsToInsert.length > 0) {
      await Product.insertMany(productsToInsert);
      console.log("✅ Successfully seeded products from local assets!");
      console.log(`\n📊 Summary:`);
      console.log(`   - Total Products: ${productsToInsert.length}`);
      console.log(`   - Images Directory: ${IMAGES_DIR}`);
      console.log(`   - Products are served via: /assets/products-images/`);
    } else {
      console.log("⚠️  No image data found in assets folder.");
    }
  } catch (error) {
    console.error("❌ Error inserting products:", error);
  } finally {
    mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
  }
};

seedProductsFromAssets();
