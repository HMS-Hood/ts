import { ElementHandle, Frame, Point } from "puppeteer";
import { myUtil, delay, Action, ChoiseAction, CustomAction, LongAction, TestAction } from "./utils";

/**
 * 竞技场
 */
const enterColosseum = new Action('enter-colosseum', 'div.main-controls .dgrid .dgrid-item:nth-of-type(4) .ditem__img');

/**
 * 广告
 */
const adv = new Action('adv', 'div.popup-layer.fullscreen', 'div.popup-layer.fullscreen div.btn_round.icn_x-icon.close');

/**
 * 左下侧英雄列表图标
 */
const collection = new Action("collection", "div.main-button.collection");

/**
 * 头部玩具菜单
 */
const toys = new ChoiseAction("toys", "div.tabs__item.icn_toys", "div.tabs__item.icn_toys", "div.tabs__item.icn_toys.active");

/**
 * 移除所有玩具
 */
const removeAllToys = new ChoiseAction("remove-all-toys", "div.best-set div.btn", "div.best-set div.btn.blue", 
  "div.best-set div.btn.gray");

/**
 * 退出玩具选择
 */
const quiteToys = new Action("quite-toys", "div.popup-layer.fullscreen", "div.popup-layer.fullscreen div.btn_round.icn_back"); 

/**
 * 进入战前部署
 */
const enterFight = new CustomAction("enter-fight", "div.colosseum-info", async(frame: Frame) => {
  try {
    // 等待 canvas 元素出现并获取其句柄
    const canvasHandle = await frame.waitForSelector('#canvas-layer1');

    // 获取 canvas 元素的位置和尺寸
    if (canvasHandle) {
      const boundingBox = await canvasHandle.boundingBox();
      if (boundingBox) {
        // 计算点击坐标，假设你要点击 canvas 的中间
        const x = boundingBox.x + boundingBox.width / 5;
        const y = boundingBox.y + boundingBox.height / 2;

        // 在指定的 (x, y) 坐标上点击
        await myUtil.mouseClick(x, y);

        console.log(`Clicked on canvas at (${x}, ${y})`);
      } else {
        console.error('Could not determine the bounding box of the canvas.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

/**
 * 确认进入部署
 */
const deploy = new Action('deploy', 'div.btn.glow-green.hidden', 'div.btn.glow-green.hidden div.btn-text');

const getPoint = async (element: ElementHandle<Element>): Promise<Point | undefined> => {
  const boundingBox = await element.boundingBox();
  if (boundingBox) {
    // 计算点击坐标，假设你要点击 canvas 的中间
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y + boundingBox.height / 2;
    return { x, y }
  }
}

/**
 * 设置人员及玩具
 */
const setDeck = new CustomAction('set-deck', 'div.colosseum-deck', async (frame: Frame) => {
  const cardsList = await frame.$('div.cards-list div.cards-list__slot div.item-container');
  if (cardsList) {
    const startPoint = await getPoint(cardsList);

    for (let i = 0; i <= 3; i++) {
      const deckSet = await frame.$$('div.player-set div.deck-slot');
      const endPoint = await getPoint(deckSet[i]);
      console.log(`loop:${i}, start=${startPoint}, end=${endPoint}`)
      if (startPoint && endPoint) {
        console.log(`begin drag & drop`)
        await myUtil.mouseMove(startPoint);
        await delay(100);
        await myUtil.mouseDown();
        await delay(300);
        await myUtil.mouseMove(endPoint);
        await delay(1000);
        await myUtil.mouseUp();
        await delay(3000)
        await myUtil.mouseClick(endPoint.x, endPoint.y);
        await new ChoiseAction('set-girl', 'div.card-menu__items', 'div.card-menu__items div.card-menu__item:nth-of-type(3)', 'div.card-menu__items div.card-menu__item:nth-of-type(3).active').doAction(frame);
        await new ChoiseAction('set-toys', 'div.toys__buttons', 'div.toys__buttons div.btn:nth-of-type(1)', 'div.toys__buttons div.btn.blue:nth-of-type(2)').doAction(frame);
        await new Action('quit-toys', 'div.popup.card-details', 'div.popup.card-details div.btn_round.icn_x-icon.close').doAction(frame);
        console.log(`delay end`)
      }
    }
  }
})

/**
 * 确认战斗
 */
const attack = new Action('attack', 'div.player-set', 'div.player-set div.btn.blue');

/**
 * 确认战斗胜利
 */
const confirmVictory = new LongAction('confirm-victory', 'div.reward-box', 'div.reward-box div.btn.blue');

/**
 * 领取竞技场完成一个场地后的奖励
 */
const getColosseumReward = new Action('get-colosseum-reward', 'div.popup-layer.dialog-fullscreen', 'div.popup-layer.dialog-fullscreen div.btn.green');

/**
 * 选取新的竞技场场地
 */
const colosseumClean = new Action('colosseum-clean', 'div.colosseum-map__arenas', 'div.colosseum-map__arenas div.colosseum-map__item:not(.locked)');

/**
 * 打开宝箱
 */
const getChest = new Action('get-chest', 'div.gatcha-inside', 'div.gatcha-inside div.btn.blue');

const testChest = new TestAction('get-chest', 'div.gatcha-inside', 'div.gatcha-inside div.btn.blue');

/**
 * 进入爬塔战斗
 */
const enterTower = new Action('enter-tower', 'div.main-controls .dgrid .dgrid-item:nth-of-type(5) .ditem__img');

/**
 * 打开塔内的宝箱
 */
const chestList = new TestAction('chest-list', 'div.chests-slots', 'div.chests-slots div.chest-slot.glow:not(.offer)');

/**
 * 开始塔内战斗
 */
const fightTower = new Action('fight-tower', 'div.tb-controls.league', 'div.tb-controls.league div.btn.glow-green.hidden div.btn-text');

const confirmTowerVictory = new LongAction('confirm-tower-victory', 'ul.reward-box', 'ul.reward-box div.btn.blue');

const removeChest = new Action('remove-chest', 'div.popup.tower-chest-open.remove', 'div.popup.tower-chest-open.remove div.btn.glow-red');

export { enterColosseum, adv, collection, toys, removeAllToys, quiteToys, enterFight, deploy, setDeck, attack, confirmVictory, getChest }
export { enterTower, chestList, fightTower, testChest, confirmTowerVictory, removeChest }