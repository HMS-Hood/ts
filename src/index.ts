import puppeteer from 'puppeteer';
import path from 'path';
import { delay, init, myUtil } from './utils';
import { adv } from './common';
import { doTower } from './tower';
import { doColosseum } from './colosseum';
import { ActionQueue } from './action/ActionQueue';
import { LoopActionQueue } from './action/LoopActionQueue';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname('d:\\personal\\ts');

(async () => {
	// Or import puppeteer from 'puppeteer-core';
	// 指定用户数据目录，确保路径正确并具有写入权限
	const userDataDir = path.join(__dirname, 'user_data'); // 你可以自定义此路径


	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch({
		headless: false, // 将此选项设置为 false
		defaultViewport: null, // 默认视口设置为 null，这样窗口会自适应大小
		userDataDir: userDataDir, // 使用指定的用户数据目录
	});

	const page = await browser.newPage();

	// Navigate the page to a URL.
	await page.goto('https://www.nutaku.net/zh/games/dirty-league/play/', { timeout: 0 });

	// 等待 iframe 加载
	const iframeHandle = await page.waitForSelector('iframe');

	// 获取 iframe 中的页面
	const frame = await iframeHandle?.contentFrame();

	const innerFramHandle = await frame?.waitForSelector('iframe');

	const innerFrame = await innerFramHandle?.contentFrame();

	// 初始化工具类
	if (innerFrame) init(page, innerFrame);

	try {
		if (innerFrame) {
      const tower = doTower(7);
      const colosseum = doColosseum(10);
			const roundAction = new LoopActionQueue([tower, colosseum], 100);
      const myList = [adv, roundAction];
      
      const myQueue = new ActionQueue(myList);

      myQueue.doAction({ baseObj: innerFrame, eventFlag: {} });
		}
	} catch (e) {
		console.log(innerFrame?.url());
		console.log(e);
	}


	// await browser.close();
})();
