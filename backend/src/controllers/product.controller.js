import { Product } from "../models/product.model.js";

export async function getAllProducts(req, res) {
  try {
    const { category, subcategory, search, featured, limit } = req.query;

    const query = { isActive: { $ne: false } };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (featured !== undefined) query.isFeatured = featured === "true";
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brandName: { $regex: search, $options: "i" } },
        { subcategory: { $regex: search, $options: "i" } },
      ];
    }

    const productLimit = Number.parseInt(limit, 10);
    let productsQuery = Product.find(query).sort({ isFeatured: -1, createdAt: -1 });

    if (Number.isFinite(productLimit) && productLimit > 0) {
      productsQuery = productsQuery.limit(Math.min(productLimit, 200));
    }

    const products = await productsQuery;
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProductCategories(_, res) {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: { $ne: false }, category: { $exists: true, $ne: "" } } },
      { $sort: { isFeatured: -1, createdAt: -1 } },
      {
        $group: {
          _id: { category: "$category", subcategory: "$subcategory" },
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ["$images", 0] } },
        },
      },
      {
        $group: {
          _id: "$_id.category",
          count: { $sum: "$count" },
          image: { $first: "$image" },
          subcategories: {
            $push: {
              name: "$_id.subcategory",
              count: "$count",
              image: "$image",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          count: 1,
          image: 1,
          subcategories: {
            $sortArray: {
              input: {
                $filter: {
                  input: "$subcategories",
                  as: "subcategory",
                  cond: {
                    $and: [
                      { $ne: ["$$subcategory.name", null] },
                      { $ne: ["$$subcategory.name", ""] },
                    ],
                  },
                },
              },
              sortBy: { name: 1 },
            },
          },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
