import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.baidu.com');
  console.log('Page title:', await page.title());

  await browser.close();
}

run().catch((err) => {
  console.error('Error running puppeteer script:', err);
});