import { ElementHandle, Frame, Point } from "puppeteer";
import { myUtil, delay } from "./utils";
import { Action } from "./action/Action";
import { ChoiseAction } from "./action/OptionalAction";
import { CustomAction } from "./action/CustomAction";
import { LongWaitAction } from "./action/LongWaitAction";
import { getChest } from "./common";

/**
 * enter colosseum
 */
const enterColosseum = new Action('enter-colosseum', 'div.main-controls .dgrid .dgrid-item:nth-of-type(4) .ditem__img');

/**
 * enter collection
 */
const collection = new Action("collection", "div.main-button.collection");

/**
 * select toys bar
 */
const toys = new ChoiseAction("toys", "div.tabs__item.icn_toys", "div.tabs__item.icn_toys", "div.tabs__item.icn_toys.active");

/**
 * remove all toys
 */
const removeAllToys = new ChoiseAction("remove-all-toys", "div.best-set div.btn", "div.best-set div.btn.blue", 
  "div.best-set div.btn.gray");

/**
 * quite collection
 */
const quiteToys = new Action("quite-toys", "div.popup-layer.fullscreen", "div.popup-layer.fullscreen div.btn_round.icn_back"); 

/**
 * select target in colosseum
 */
const selectTarget = new CustomAction("select-target", "div.colosseum-info", async(frame: Frame) => {
  try {
    // 等待 canvas 元素出现并获取其句柄
    const canvasHandle = await frame.waitForSelector('#canvas-layer1');

    // 获取 canvas 元素的位置和尺寸
    if (canvasHandle) {
      const boundingBox = await canvasHandle.boundingBox();
      if (boundingBox) {
        // 计算点击坐标，中间偏左，即最左侧的目标
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
 * enter deploy
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
 * deploy members and toys
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
 * final enter
 */
const attack = new Action('attack', 'div.player-set', 'div.player-set div.btn.blue');

/**
 * confirm victory
 */
const confirmVictory = new LongWaitAction('confirm-victory', 'div.reward-box', 'div.reward-box div.btn.blue');

/**
 * get colosseum reward
 */
const getColosseumReward = new Action('get-colosseum-reward', 'div.popup-layer.dialog-fullscreen', 'div.popup-layer.dialog-fullscreen div.btn.green');

/**
 * check new colosseum
 */
const colosseumClean = new Action('colosseum-clean', 'div.colosseum-map__arenas', 'div.colosseum-map__arenas div.colosseum-map__item:not(.locked)');

/**
 * enter colosseum from main, and do colosseum with times
 * @param frame 
 * @param times count of do colosseum
 */
const doColosseum = async (frame: Frame, times: number = 1) => {
  await enterColosseum.doAction(frame);
  for (let i = 0; i <= times; i++) {
    await collection.doAction(frame);
    await toys.doAction(frame);
    await removeAllToys.doAction(frame);
    await quiteToys.doAction(frame);
    await selectTarget.doAction(frame);
    await deploy.doAction(frame);
    await setDeck.doAction(frame);
    await attack.doAction(frame);
    await confirmVictory.doAction(frame);
    await getChest.doAction(frame);
  }
}

export { doColosseum }
