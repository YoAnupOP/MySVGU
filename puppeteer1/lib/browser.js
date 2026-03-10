import puppeteer from "puppeteer";

import { erpConfig } from "./config.js";

let browserPromise = null;

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: erpConfig.headless,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  browser.once("disconnected", () => {
    browserPromise = null;
  });

  return browser;
}

export async function getBrowser() {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }

  return await browserPromise;
}