import {lyricsEditorPage} from "@/web/lyrics-editor-page";
import express from "express";

const router = express.Router();
// GET 页面
router.get("/", lyricsEditorPage);

export { router as lyricsEditorRouter };
