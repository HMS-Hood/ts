import { Action, ActionContext } from "./action/Action";
import { LongWaitAction } from "./action/LongWaitAction";
import { TestAction } from "./action/TestAction";
import { skipableAdv, getChest, quiteScreen } from "./common";
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
const setDeckToys = new CustomAction('set-deck-toys', 'div.player-set', async (context: ActionContext) => {
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
  for (let i = 0; i <= 4; i++) {
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
  [stopTower, skipableAdv]
);

/**
 * confirm victory in tower
 */
const confirmVictory = new LongWaitAction('confirm--victory', 'ul.reward-box', 'ul.reward-box div.btn.blue', [removeChest]);

/**
 * confirm lose in tower
 */
const confirmTowerLose = new LongWaitAction('confirm-tower-lose', 'div.popup.tower-victory.lose', 'div.popup.tower-victory.lose div.btn.gray', [skipableAdv]);

const fightResult = new SkipableList([confirmVictory, confirmTowerLose, skipableAdv]);

/**
 * lose tower
 */
const loseTower = new CustomAction("lose-tower", "div.canvas-wrapper__background.canvas-wrapper__background--battle", async(context: ActionContext) => {
  const { baseObj: frame } = context;
  try {
    // 等待 canvas 元素出现并获取其句柄
    const canvasHandle = await frame.waitForSelector('#canvas-layer1');
    await delay(5000);
    // 获取 canvas 元素的位置和尺寸
    if (canvasHandle) {
      const boundingBox = await canvasHandle.boundingBox();
      if (boundingBox) {
        for (let i = 1; i <= 20; i++) {
        // 计算点击坐标，中间偏左，即最左侧的目标
          const x = boundingBox.x + 40;
          const y = boundingBox.y + boundingBox.height - 40;

          // 在指定的 (x, y) 坐标上点击
          await myUtil.mouseClick(x, y);
          await myUtil.mouseMove({x, y});
          console.log(`Clicked on canvas at (${x}, ${y})`);
          await delay(1000);
          const next = await frame.$('div.popup.tower-victory.lose');
          if (next) i = 21;
        }

      } else {
        console.error('Could not determine the bounding box of the canvas.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

const doTower = (times: number = 1) => {
  const loopQueue = new LoopActionQueue([
    collectChest, fightTower, fightResult
  ], times, NO_CHEST_SLOT_IN_TOWER);
  return new ActionQueue([enterTower, collection, setDeckToys, quiteToys, loopQueue, quiteScreen]);
}

const lostTower = (times: number = 1) => {
  const loopQueue = new LoopActionQueue([
    fightTower, loseTower, confirmTowerLose
  ], times, NO_CHEST_SLOT_IN_TOWER);
  return new ActionQueue([enterTower, loopQueue, quiteScreen]);
}

export { doTower, lostTower, confirmTowerLose, confirmVictory }
