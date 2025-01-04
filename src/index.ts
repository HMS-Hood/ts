import puppeteer from 'puppeteer';
import path from 'path';
import { delay, init, myUtil } from './utils';
import { adv, getChest } from './common';
import { confirmTowerLose, doTower, lostTower } from './tower';
import { doColosseum } from './colosseum';
import { ActionQueue } from './action/ActionQueue';
import { LoopActionQueue } from './action/LoopActionQueue';
import { SkipableList } from './action/SkipableList';
import { doEvent } from './event';
import { Action } from './action/Action';

const fightLost = new Action('fight-lost', 'div.fight-victory.popup.lose', 'div.fight-victory.popup.lose div.btn.gray');
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname('d:\\personal\\ts');
// 'button outlined white ripple js-btn-modal js-login'
// 'flx content-login js-content-login'
// name 'email' 'password' 'button filled primary fnt-large-2 txt-up ripple js-btn-submit'
// 'button filled primary fnt-large-2 txt-up ripple js-btn-submit'
// 'button filled primary btn-play txt-up ripple js-main-button js-action-after-login'
// popup fight-victory lose center
(async () => {
	while(true) {
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
		// await delay(20000)

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
				const preDo = new SkipableList([adv, confirmTowerLose, getChest, fightLost]);
				const tower = doTower(7);
				const lose = lostTower(7);
				const colosseum = doColosseum(5);
				const event = doEvent();
				const roundQueue = new LoopActionQueue([event, colosseum, tower], 1000);
				
				const myQueue = new ActionQueue([preDo, roundQueue]);

				await myQueue.doAction({ baseObj: innerFrame, eventFlag: {} });
			}
		} catch (e) {
			console.log(innerFrame?.url());
			console.log(e);
		} finally {
			console.log('the end');
			await browser.close();
		}
	}
})();
