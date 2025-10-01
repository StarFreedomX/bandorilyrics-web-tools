import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export function mainPage(req: Request, res: Response) {
    const filePath = path.join(__dirname, "/main-page.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(fs.readFileSync(filePath, "utf-8"));
}
