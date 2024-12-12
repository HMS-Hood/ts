import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { init, myUtil } from './utils';
import { enterColosseum, adv, collection, toys, removeAllToys, enterFight, quiteToys, deploy, setDeck,
	attack, confirmVictory, getChest, enterTower, chestList, fightTower, testChest, confirmTowerVictory
 } from './main';

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
		// await innerFrame?.waitForSelector('div.main-controls .dgrid .dgrid-item:nth-of-type(4) .ditem__img');
		// await innerFrame?.locator('div.main-controls .dgrid .dgrid-item:nth-of-type(4) .ditem__img').click();
		await myUtil.doActionWithOptional(adv, enterTower);
		if (innerFrame) {
			for (let i = 0; i <= 300; i++) {
				// await myUtil.doActionWithOptional(getChest, collection);
				// // await collection.doAction(innerFrame);
				// await toys.doAction(innerFrame);
				// await removeAllToys.doAction(innerFrame);
				// await quiteToys.doAction(innerFrame);
				// await enterFight.doAction(innerFrame);
				// await deploy.doAction(innerFrame);
				// await setDeck.doAction(innerFrame);
				// await attack.doAction(innerFrame);
				// await confirmVictory.doAction(innerFrame);
				// await getChest.doAction(innerFrame);

				const chest = await chestList.testAction(innerFrame);
				if (chest) {
					getChest.doAction(innerFrame);
					testChest.testAction(innerFrame);
				}
				await fightTower.doAction(innerFrame);
				await confirmTowerVictory.doAction(innerFrame);
			}
		}
	} catch (e) {
		console.log(innerFrame?.url());
		console.log(e);
	}


	// await browser.close();
})();
