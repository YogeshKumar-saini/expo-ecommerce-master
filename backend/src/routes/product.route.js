import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  getProductCategories,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/categories", getProductCategories);
router.get("/:id", getProductById);

export default router;
