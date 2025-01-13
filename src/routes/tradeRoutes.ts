import { getLiveStockPrice } from "../controllers/tradesControllers"
import { Router } from "express";

const router = Router();

router.get('/live', getLiveStockPrice)

export default router