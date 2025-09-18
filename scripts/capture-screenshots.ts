// /ui/capture-screenshots.ts
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

(async () => {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const pagesToCapture = ["/", "/about", "/dashboard"]; // extend as needed
  const outDir = path.join(process.cwd(), "screenshots");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  for (const route of pagesToCapture) {
    const url = `${baseUrl}${route}`;
    console.log(`Capturing: ${url}`);
    await page.goto(url, { waitUntil: "networkidle" });
    const fileName = route === "/" ? "home" : route.replace(/\//g, "_");
    await page.screenshot({ path: path.join(outDir, `${fileName}.png`) });
  }

  await browser.close();
  console.log(`Screenshots saved to ${outDir}`);
})();
