import { Action, ActionContext } from "./action/Action";
import { LongWaitAction } from "./action/LongWaitAction";
import { TestAction } from "./action/TestAction";
import { adv, skipableAdv, newSlotAdv, getChest, quiteScreen } from "./common";
import { SkipableAction } from "./action/SkipableAction";
import { LoopActionQueue } from "./action/LoopActionQueue";
import { ActionQueue } from "./action/ActionQueue";
import { SetEventFlat } from "./action/SetEventFlag";
import { ChoiseAction } from "./action/OptionalAction";
import { CustomAction } from "./action/CustomAction";
import { delay, getPoint, myUtil } from "./utils";
import { collection, quiteToys, removeAllToys, toys } from "./colosseum";
import { SkipableList } from "./action/SkipableList";


/**
 * enter tower
 */
const enterTower = new Action('enter-tower', 'div.main-controls .dgrid .dgrid-item:nth-of-type(5) .ditem__img');

/**
 * enter deck
 */
const deck = new ChoiseAction("deck", "div.tabs__item.icn_decks", "div.tabs__item.icn_decks", "div.tabs__item.icn_decks.active");

/**
 * set deck toys
 */
const setDeckToys = (decksCount: number) => new CustomAction('set-deck-toys', 'div.player-set', async (context: ActionContext) => {
  const { baseObj: frame } = context;
  await deck.doAction(context);
  const apObj = await frame.$('div.player-set div.hp.icn_fist.icn_28');
  const ap = await apObj?.evaluate(elment => elment.innerHTML);
  if (ap && parseInt(ap) > 5000) {
    return;
  }
  await toys.doAction(context);
  await removeAllToys.doAction(context); 
  await deck.doAction(context);
  const deckSet = await frame.$$('div.player-set div.deck-slot');
  for (let i = 0; i <= decksCount; i++) {
    const endPoint = await getPoint(deckSet[i]);
    if (endPoint) {
      await delay()
      await myUtil.mouseClick(endPoint.x, endPoint.y);
      await new ChoiseAction('set-girl', 'div.card-menu__items', 'div.card-menu__items div.card-menu__item:nth-of-type(3)', 'div.card-menu__items div.card-menu__item:nth-of-type(3).active').doAction(context);
      await new ChoiseAction('set-toys', 'div.toys__buttons', 'div.toys__buttons div.btn:nth-of-type(1)', 'div.toys__buttons div.btn.blue:nth-of-type(2)').doAction(context);
      await new Action('quit-toys', 'div.popup.card-details', 'div.popup.card-details div.btn_round.icn_x-icon.close').doAction(context);
    }
  }
})

/**
 * open chest slots in tower
 */
const collectChest = new TestAction(
  'chest-list',
  'div.chests-slots',
  'div.chests-slots div.chest-slot.glow:not(.offer)',
  [ getChest ]
);

/**
 * get reward for 5 victory
 */
const getCollection = new TestAction(
  'get-collection',
  'div.tb-controls.league',
  'div.tb-controls.league div.tb-reward__btn.btn.blue',
  [ getChest ]
);

/**
 * do tower
 */
const fightTower = new Action('fight-tower', 'div.tb-controls.league', 'div.tb-controls.league div.btn.glow-green.hidden div.btn-text');

const NO_CHEST_SLOT_IN_TOWER = 'NO_CHEST_SLOT_IN_TOWER'

/**
 * stop tower when no slot left
 */
const stopTower = new SetEventFlat(NO_CHEST_SLOT_IN_TOWER);

/**
 * abondant chest
 */
const removeChest = new SkipableAction(
  'remove-chest',
  'div.popup.tower-chest-open.remove',
  'div.popup.tower-chest-open.remove div.btn.glow-red',
  // [stopTower, skipableAdv]
  [ stopTower, new SkipableList([ adv, newSlotAdv ]) ]
);

/**
 * confirm victory in tower
 */
const confirmVictory = new LongWaitAction('confirm--victory', 'div.popup.tower-victory:not(.lose)', 'div.popup.tower-victory:not(.lose) div.btn.blue', [new SkipableList([ adv, removeChest ])]);

/**
 * confirm lose in tower
 */
const confirmTowerLose = new LongWaitAction('confirm-tower-lose', 'div.popup.tower-victory.lose', 'div.popup.tower-victory.lose div.btn.gray', [skipableAdv]);

const fightResult = new SkipableList([confirmVictory, confirmTowerLose, adv]);

/**
 * lose tower
 */
const getLoseTower = (auto: boolean, doVictory: boolean = false) => new CustomAction("lose-tower", "div.canvas-wrapper__background.canvas-wrapper__background--battle", async(context: ActionContext) => {
  const { baseObj: frame } = context;
  try {
    // 等待 canvas 元素出现并获取其句柄
    const canvasHandle = await frame.waitForSelector('#canvas-layer1');
    await delay(8000);
    // 获取 canvas 元素的位置和尺寸
    if (canvasHandle) {
      const boundingBox = await canvasHandle.boundingBox();
      if (boundingBox) {
        const x = boundingBox.x + boundingBox.width * 1 / 20;
        const autoX = boundingBox.x + boundingBox.width * 1 / 10;
        const y = boundingBox.y + boundingBox.height * 17 / 18;
        if (doVictory) {
          console.log("do victory")
          await myUtil.mouseClick(autoX, y);
          await fightResult.doAction(context);
          return;
        }
        if (auto) {
          console.log("set auto")
          await myUtil.mouseClick(autoX, y);
          auto = false;
        }
        for (let i = 1; i <= 10; i++) {
          // 在指定的 (x, y) 坐标上点击
          await myUtil.mouseClick(x, y);
          // await myUtil.mouseMove({x, y});
          console.log(`Clicked on canvas at (${x}, ${y})`);
          await delay(3000);
          const next = await frame.$('div.popup.tower-victory');
          if (next) i = 10;
        }
        await fightResult.doAction(context);
      } else {
        console.error('Could not determine the bounding box of the canvas.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

const limitedFightTower = new CustomAction('fight-tower', 'div.tb-controls.league', async(context: ActionContext) => {
  const { baseObj } = context;
  
  let progressObj = await baseObj.$('div.tb-controls.league div.progress__estimate.icn_cup_yellow');
  const data = await progressObj?.evaluate(el => el.innerHTML);
  const initData = data?.replace(/\"(\n*)\".*?\" \/ \".*?\"\n*\"/s, "$1");

  let auto = true;
  if (initData && Number.parseInt(initData) >= 240) {
    for (let i = 0; i < 8; i+=1) {
      // progressObj = await baseObj.$('div.tb-controls.league div.progress__estimate.icn_cup_yellow');
      // const curDataStr = await progressObj?.evaluate(el => el.innerHTML);
      // const curData = curDataStr?.replace(/\"(\n*)\".*?\" \/ \".*?\"\n*\"/s, "$1");
      // if (Number.parseInt(curData??'0') < Number.parseInt(initData)) auto =false;
      await fightTower.doAction(context);
      await getLoseTower(auto).doAction(context);
      auto = false;
    }
    await fightTower.doAction(context);
    await getLoseTower(auto, true).doAction(context)
  }
})

const doTower = (times: number = 1, limit: boolean = false, decksCount: number = 4) => {
  if (limit) {
    const loopQueue = new LoopActionQueue([
      collectChest, getCollection, limitedFightTower, fightTower, fightResult
    ], times, NO_CHEST_SLOT_IN_TOWER);
    return new ActionQueue([enterTower, loopQueue, quiteScreen]);
  } else {
    const loopQueue = new LoopActionQueue([
      collectChest, getCollection, fightTower, fightResult
    ], times, NO_CHEST_SLOT_IN_TOWER);
    return new ActionQueue([enterTower, collection, setDeckToys(decksCount), quiteToys, loopQueue, quiteScreen]);
  }
}

const lostTower = (times: number = 1) => {
  const loopQueue = new LoopActionQueue([
    fightTower, confirmTowerLose
  ], times, NO_CHEST_SLOT_IN_TOWER);
  return new ActionQueue([enterTower, loopQueue, quiteScreen]);
}

export { doTower, lostTower, confirmTowerLose, confirmVictory }
