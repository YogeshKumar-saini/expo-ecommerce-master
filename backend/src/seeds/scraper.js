import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.resolve(__dirname, "../../../scraped_products.csv");
const STATE_PATH = path.resolve(__dirname, "./scraper_state.json");

// Helper to escape values for CSV columns
const escapeCsvValue = (val) => {
  if (val === null || val === undefined) return "";
  let str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

// 24 Categories of complete wears
const CATEGORIES = [
  // Men
  { path: "men-tshirts", category: "Men" },
  { path: "men-casual-shirts", category: "Men" },
  { path: "men-formal-shirts", category: "Men" },
  { path: "men-jeans", category: "Men" },
  { path: "men-casual-trousers", category: "Men" },
  { path: "men-sports-shoes", category: "Men" },
  { path: "men-casual-shoes", category: "Men" },
  { path: "men-jackets", category: "Men" },
  { path: "men-sweaters", category: "Men" },
  { path: "men-activewear", category: "Men" },
  // Women
  { path: "women-tops-and-tees", category: "Women" },
  { path: "women-dresses", category: "Women" },
  { path: "women-kurtas-suits", category: "Women" },
  { path: "women-jeans", category: "Women" },
  { path: "women-trousers", category: "Women" },
  { path: "women-jackets-coats", category: "Women" },
  { path: "women-flats", category: "Women" },
  { path: "women-heels", category: "Women" },
  { path: "women-sports-shoes", category: "Women" },
  // Kids
  { path: "kids-tshirts", category: "Kids" },
  { path: "girls-dresses", category: "Kids" },
  { path: "boys-shirts", category: "Kids" },
  { path: "kids-footwear", category: "Kids" },
  { path: "kids-jackets", category: "Kids" }
];

const CSV_HEADERS = [
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
  "isFeatured"
];

// Load scraping state
const loadState = () => {
  if (fs.existsSync(STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
    } catch (e) {
      console.warn("⚠️ State file corrupted. Starting fresh.");
    }
  }
  return {
    totalScraped: 0,
    categoryPages: {} // Maps category path to last scraped page
  };
};

const state = loadState();

// Save state safely
const saveState = () => {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
};

// Thread-safe synchronous CSV write
const appendProductToCsv = (p) => {
  if (!fs.existsSync(CSV_PATH) || fs.statSync(CSV_PATH).size === 0) {
    fs.writeFileSync(CSV_PATH, CSV_HEADERS.join(",") + "\n", "utf8");
  }

  const row = [
    p.name,
    p.description,
    p.price,
    p.stock,
    p.category,
    p.images.join(";"),
    p.averageRating,
    p.totalReviews,
    p.sizes,
    p.isActive,
    p.isFeatured
  ];

  const csvRow = row.map(escapeCsvValue).join(",") + "\n";
  fs.appendFileSync(CSV_PATH, csvRow, "utf8");
};

const TARGET_TOTAL = 100000;
const CONCURRENCY_LIMIT = 200; // 5 Workers fetching categories in parallel

const runWorker = async (workerId, categoryQueue) => {
  while (categoryQueue.length > 0 && state.totalScraped < TARGET_TOTAL) {
    const activeCategory = categoryQueue.shift();
    if (!activeCategory) break;

    // Load starting page for this category
    let page = state.categoryPages[activeCategory.path] || 1;
    let hasMore = true;

    console.log(`[Worker ${workerId}] 🟢 Started Category: ${activeCategory.path} starting at page ${page}`);

    while (hasMore && state.totalScraped < TARGET_TOTAL) {
      const targetUrl = `https://www.myntra.com/${activeCategory.path}?p=${page}`;
      
      let retries = 10;
      let html = null;

      while (retries > 0 && !html) {
        try {
          const response = await axios.get(targetUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9"
            },
            timeout: 10000
          });
          html = response.data;
        } catch (err) {
          retries--;
          console.warn(`[Worker ${workerId}] ⚠️ Fetch error for ${activeCategory.path} (p=${page}): ${err.message}. Retries left: ${retries}`);
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      }

      if (!html) {
        console.error(`[Worker ${workerId}] ❌ Skipping page ${page} of ${activeCategory.path} after failures.`);
        break;
      }

      const $ = cheerio.load(html);
      let parsedProducts = [];

      $("script").each((_, el) => {
        const text = $(el).html() || "";
        if (text.startsWith("window.__myx = ")) {
          let jsonStr = text.substring("window.__myx = ".length).trim();
          if (jsonStr.endsWith(";")) {
            jsonStr = jsonStr.slice(0, -1);
          }
          try {
            const parsedData = JSON.parse(jsonStr);
            parsedProducts = parsedData.searchData?.results?.products || [];
          } catch (e) {}
        }
      });

      if (parsedProducts.length === 0) {
        console.log(`[Worker ${workerId}] ⏹️ Finished Category: ${activeCategory.path} (No more products on page ${page})`);
        hasMore = false;
        break;
      }

      let pageSaved = 0;
      parsedProducts.forEach((p) => {
        const fullName = p.brand ? `${p.brand} ${p.productName}` : p.productName;
        
        const cleanImages = (p.images || [])
          .filter((img) => img.src && img.view !== "size_representation")
          .map((img) => img.src.replace("http://", "https://"))
          .slice(0, 4);

        if (cleanImages.length === 0) return;

        const sizesStr = Array.isArray(p.sizes) ? p.sizes.join(", ") : (p.sizes || "S, M, L, XL, XXL");
        const description = `Indulge in premium fashion comfort with the new ${fullName}. Made with premium quality materials, perfect for all wears catalog.`;

        const mappedProduct = {
          name: fullName,
          description,
          price: p.price || 499,
          stock: 100,
          category: activeCategory.category,
          images: cleanImages,
          averageRating: p.rating ? Math.round(p.rating * 10) / 10 : 4.2,
          totalReviews: p.ratingCount || 15,
          sizes: sizesStr,
          isActive: true,
          isFeatured: Math.random() > 0.85
        };

        appendProductToCsv(mappedProduct);
        pageSaved++;
        state.totalScraped++;
      });

      console.log(`[Worker ${workerId}] ✅ Scraped ${pageSaved} items from ${activeCategory.path} (Page ${page}). Total: ${state.totalScraped}`);
      
      // Update state for this category
      state.categoryPages[activeCategory.path] = page;
      saveState();

      page++;

      // Polite delay between requests
      const delay = 1200 + Math.random() * 800;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const scrapeParallel = async () => {
  console.log("🚀 Starting Parallel Large Scale Myntra Scraper...");
  console.log(`📊 Current progress: ${state.totalScraped} / ${TARGET_TOTAL} products.`);
  console.log(`🔥 Running with ${CONCURRENCY_LIMIT} concurrent worker pools.`);

  // Create a queue of categories to scrape
  const categoryQueue = [...CATEGORIES];

  // Spawn workers
  const workerPromises = [];
  for (let i = 1; i <= CONCURRENCY_LIMIT; i++) {
    workerPromises.push(runWorker(i, categoryQueue));
  }

  // Wait for all workers to finish
  await Promise.all(workerPromises);

  if (state.totalScraped >= TARGET_TOTAL) {
    console.log(`\n🏆 Target of ${TARGET_TOTAL} products reached! Large scale scraping complete.`);
    if (fs.existsSync(STATE_PATH)) {
      fs.unlinkSync(STATE_PATH);
    }
  } else {
    console.log(`\n🏁 Finished running through all categories. Scraped ${state.totalScraped} products total.`);
  }
};

scrapeParallel();
