import inquirer from 'inquirer';
import puppeteer, { Frame, Page } from 'puppeteer';
import path from 'path';
import { delay, init } from './utils';
import { adv, getChest } from './common';
import { confirmTowerLose, doTower, lostTower } from './tower';
import { doColosseum } from './colosseum';
import { ActionQueue } from './action/ActionQueue';
import { LoopActionQueue } from './action/LoopActionQueue';
import { SkipableList } from './action/SkipableList';
import { doEvent } from './event';
import { Action } from './action/Action';
import { SimpleDo } from './action/SimpleDo';

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
  const question = {
    type: 'list' as const,
    name: 'Entry',
    message: '请选择入口:',
    choices: [
			{ name: 'nutaku', value: 'nutaku' },
			{ name: 'original', value: 'original' },
		],
  };

	const question1 = {
    type: 'list' as const,
    name: 'DoAction',
    message: '请选择运行方式:',
    choices: [
			{ name: '自动执行', value: true },
			{ name: '启动实例', value: false },
		],
  };

	const question2 = {
    type: 'list' as const,
    name: 'ShowMode',
    message: '请选择显示方式:',
    choices: [
			{ name: '显示', value: false },
			{ name: '后台', value: true },
		],
  };

	const entry = (await inquirer.prompt(question)).Entry;
	const runMode = (await inquirer.prompt(question1)).DoAction;
	const showMode = (await inquirer.prompt(question2)).ShowMode;

	console.log(`你选择了: ${entry},${runMode},${showMode}`);


	let doLoop = true;
	while(doLoop) {
		// Or import puppeteer from 'puppeteer-core';
		// 指定用户数据目录，确保路径正确并具有写入权限
		const userDataDir = path.join(__dirname, `user_data${entry}`); // 你可以自定义此路径


		// Launch the browser and open a new blank page
		const browser = await puppeteer.launch({
			headless: showMode, // 将此选项设置为 false
			defaultViewport: null, // 默认视口设置为 null，这样窗口会自适应大小
			userDataDir: userDataDir, // 使用指定的用户数据目录
		});

		const page = await browser.newPage();
		// Navigate the page to a URL.
		const url: {[key: string]: string} = {
			nutaku: 'https://www.nutaku.net/zh/games/dirty-league/play/',
			original: 'https://dirtyleague.com/?utm_source=forum&utm_campaign=discord_dl_direct&utm_content=discord&land=direct',
		}
		await page.goto(url[entry], { timeout: 0 });
		// await delay(20000)

		let baseObj: Page | Frame | undefined;

		// 初始化工具类
		init(page);

		if (runMode) {
			if (entry === 'nutaku') {
				// 等待 iframe 加载
				const iframeHandle = await page.waitForSelector('iframe');

				// 获取 iframe 中的页面
				const frame = await iframeHandle?.contentFrame();

				const innerFramHandle = await frame?.waitForSelector('iframe');

				baseObj = await innerFramHandle?.contentFrame();

				try {
					if (baseObj) {
						const preDo = new SkipableList([adv, confirmTowerLose, getChest, fightLost]);
						const tower = doTower(7);
						const lose = lostTower(7);
						const colosseum = doColosseum(5);
						const event = doEvent(5);
						const roundQueue = new LoopActionQueue([colosseum, tower], 1000);
						
						const myQueue = new ActionQueue([preDo, roundQueue]);

						await myQueue.doAction({ baseObj: baseObj, eventFlag: {} });
					}
				} catch (e) {
					console.log(baseObj?.url());
					console.log(e);
				} finally {
					console.log('the end');
					await browser.close();
				}
			} else {
				baseObj = page;

				try {
					if (baseObj) {
						const preDo = new SkipableList([adv, confirmTowerLose, getChest, fightLost]);
						const tower = doTower(7, true, 2);
						const lose = lostTower(7);
						const colosseum = doColosseum(5, 1, 'center');
						const event = doEvent(2);
						const waitAction = new SimpleDo(async() => {
							await delay(10000)
						});
						const roundQueue = new LoopActionQueue([ tower ], 1000);
						
						const myQueue = new ActionQueue([preDo, roundQueue]);

						await myQueue.doAction({ baseObj: baseObj, eventFlag: {} });
					}
				} catch (e) {
					console.log(baseObj?.url());
					console.log(e);
				} finally {
					console.log('the end');
					await browser.close();
				}
			}
		} else {
			doLoop = false;
		}
	}
})();
