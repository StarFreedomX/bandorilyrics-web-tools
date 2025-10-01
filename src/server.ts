import express from "express";
import { lrcFixRouter } from "@/router/lrc-fix-router";
import { kana2RomajiRouter} from "@/router/kana-to-romaji-router";
import { mainPageRouter } from "@/router/main-router";

const app = express();
app.use(express.json());

app.use("/", mainPageRouter)
app.use("/lrc-fix", lrcFixRouter);
app.use("/kana-to-romaji", kana2RomajiRouter);

app.listen(10519,"0.0.0.0", () => {
    console.log("Server running on http://localhost:10519");
});
