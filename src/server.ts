import express from "express";
import * as dotenv from "dotenv";
import { lrcFixRouter } from "@/router/lrc-fix-router";
import { kana2RomajiRouter} from "@/router/kana-to-romaji-router";
import { mainPageRouter } from "@/router/main-router";
import * as process from "node:process";
import { logger } from "@/logger";
import https from "https";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/", mainPageRouter)
app.use("/lrc-fix", lrcFixRouter);
app.use("/kana-to-romaji", kana2RomajiRouter);

const port: number = parseInt(process.env.PORT || '3002');
const host: string = process.env.HOST || "localhost";

if (isNaN(port)) {
    logger('expressMainThread', 'port is not a number');
    process.exit(1);
}

//404
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});


// 如果配置了 HTTPS 证书，就用 HTTPS，否则用HTTP
if (process.env.HTTPS === "true" && process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
    const options = {
        key: fs.readFileSync(process.env.HTTPS_KEY),
        cert: fs.readFileSync(process.env.HTTPS_CERT)
    };

    https.createServer(options, app).listen(port, host, () => {
        logger("expressMainThread", `HTTPS Server running on https://${host}:${port}`);
        logger("expressMainThread", `Website is available on https://localhost:${port}`);
    });
} else {
    app.listen(port, host, () => {
        logger("expressMainThread", "（未检测到证书路径，使用 HTTP 模式）");
        logger("expressMainThread", `HTTP Server running on http://${host}:${port}`);
        logger("expressMainThread", `Website is available on http://localhost:${port}`);
    });
}
