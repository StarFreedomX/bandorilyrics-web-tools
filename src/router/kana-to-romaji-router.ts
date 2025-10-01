import express from "express";
import { handleKana2Romaji } from "@/tools/kana-to-romaji-handler";
import { kana2RomajiPage } from "@/web/kana-to-romaji-page";

const router = express.Router();
// GET 页面
router.get("/", kana2RomajiPage);
// POST /lrc-fix
router.post("/handler", (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "text is required" });
    }
    const result = handleKana2Romaji(text);
    res.type("text/plain; charset=utf-8").send(result);
});

export { router as kana2RomajiRouter };
