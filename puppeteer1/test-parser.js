import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";

import { extractAttendanceFromDom } from "./lib/attendanceParser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureHtmlPath = path.join(__dirname, "fixtures", "attendance-table.html");
const fixtureJsonPath = path.join(__dirname, "fixtures", "attendance-table.json");

const html = await fs.readFile(fixtureHtmlPath, "utf8");
const expected = JSON.parse(await fs.readFile(fixtureJsonPath, "utf8"));

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const parsed = await page.evaluate(
    extractAttendanceFromDom,
    "23CI2010277",
    "#MainContent_GridView2",
  );

  assert.deepEqual(parsed, expected);
  console.log("Attendance parser fixture passed.");
} finally {
  await browser.close();
}
