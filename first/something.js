const puppeteer = require("puppeteer");
const truncate = require("./truncate.js");

console.log(truncate("testing something", 10));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://httpbin.org/ip");
  await browser.close();
})().catch(e => console.log(e.message));
