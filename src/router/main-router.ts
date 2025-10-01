import express from "express";
import { mainPage } from "@/web/main-page";

const router = express.Router();
// GET 页面
router.get("/", mainPage);

export { router as mainPageRouter };
