import express from "express";
import { handleRuby } from "@/tools/lrc-fix-handler";
import { lrcFixPage } from "@/web/lrc-fix-page";

const router = express.Router();
// GET 页面
router.get("/", lrcFixPage);
// POST /lrc-fix
router.post("/handler", (req, res) => {
    const { text, ignoreError } = req.body;
    if (!text) {
        return res.status(400).json({ error: "text is required" });
    }
    const result = handleRuby(text, ignoreError);
    res.type("text/plain; charset=utf-8").send(result);
});

export { router as lrcFixRouter };
