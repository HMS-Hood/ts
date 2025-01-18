import { ElementHandle } from "puppeteer";
import { myUtil, delay, getPoint } from "./utils";
import { Action, ActionContext } from "./action/Action";
import { ChoiseAction } from "./action/OptionalAction";
import { CustomAction } from "./action/CustomAction";
import { LongWaitAction } from "./action/LongWaitAction";
import { adv, getChest, quiteScreen, skipableAdv } from "./common";
import { LoopActionQueue } from "./action/LoopActionQueue";
import { ActionQueue } from "./action/ActionQueue";
import { SetEventFlat } from "./action/SetEventFlag";
import { SkipableList } from "./action/SkipableList";
import { ChoiseList } from "./action/ChoiseList";
import { ChooseQueue } from "./action/ChooseQueue";

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
const selectTarget = (location: 'left' | 'center') => new CustomAction("select-target", "div.colosseum-info", async (context: ActionContext) => {
  const { baseObj: frame } = context;
  try {
    // 等待 canvas 元素出现并获取其句柄
    const canvasHandle = await frame.waitForSelector('#canvas-layer1');

    // 获取 canvas 元素的位置和尺寸
    if (canvasHandle) {
      const boundingBox = await canvasHandle.boundingBox();
      if (boundingBox) {
        // 计算点击坐标，中间偏左，即最左侧的目标
        const x = boundingBox.x + boundingBox.width / (location === 'left' ? 5 : 2.2);
        const y = boundingBox.y + boundingBox.height / 2;

        // 在指定的 (x, y) 坐标上点击
        await myUtil.mouseClick(x, y);

        console.log(`Clicked on canvas at (${x}, ${y}) in (${boundingBox.x}, ${boundingBox.y}), (${boundingBox.width}, ${boundingBox.height})`);
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

const NOT_ENOUPH_CARDS_IN_COLOSSEUM = 'NOT_ENOUPH_CARDS_IN_COLOSSEUM';
/**
 * deploy members and toys
 */
const setDeck = (slot: number) => new CustomAction('set-deck', 'div.colosseum-deck', async (context: ActionContext) => {
  const { baseObj: frame } = context;
  for (let i = 0; i <= slot; i++) {
    let cardsList: ElementHandle<HTMLDivElement> | null = null;

    while (cardsList === null) {
      cardsList = await frame.$('div.cards-list div.cards-list__slot:not(.locked) div.item-container');
      if (cardsList === null) await delay(10000);
    }

    const startPoint = await getPoint(cardsList);
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
      await delay(300);
      await myUtil.mouseUp();
      await delay(1000)
      await myUtil.mouseClick(endPoint.x, endPoint.y);
      await new ChoiseAction('set-girl', 'div.card-menu__items', 'div.card-menu__items div.card-menu__item:nth-of-type(3)', 'div.card-menu__items div.card-menu__item:nth-of-type(3).active').doAction(context);
      await new ChoiseAction('set-toys', 'div.toys__buttons', 'div.toys__buttons div.btn:nth-of-type(1)', 'div.toys__buttons div.btn.blue:nth-of-type(2)').doAction(context);
      await new Action('quit-toys', 'div.popup.card-details', 'div.popup.card-details div.btn_round.icn_x-icon.close').doAction(context);
      console.log(`delay end`)
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
const confirmVictory = new LongWaitAction('confirm-victory', 'div.popup.event-victory.colosseum:not(.loose)', 'div.popup.event-victory.colosseum:not(.loose) div.btn.blue');

const fightLost = new Action('fight-lost', 'div.popup.loose', 'div.popup.loose div.btn.gray');

const fightResult = new ChoiseList([fightLost, confirmVictory]);
/**
 * check new colosseum
 */
const checkNewColosseum = new Action('check-new-colosseum',
  'div.colosseum-map__arenas div.colosseum-map__item:not(.locked) div.colosseum-map__arena',
  'div.colosseum-map__arenas div.colosseum-map__item:not(.locked) div.colosseum-map__arena');

/**
 * get colosseum reward
 */
const getColosseumReward = new Action('get-colosseum-reward', 'div.popup-layer.dialog-fullscreen', 'div.popup-layer.dialog-fullscreen div.btn.green');

const getReward = new SkipableList([getColosseumReward, getChest, checkNewColosseum, adv]);

/**
 * enter colosseum from main, and do colosseum with times
 * @param frame 
 * @param times count of do colosseum
 */
const doColosseum = (times: number = 1, slot: number = 3, location: 'left' | 'center' = 'left') => {
  const fight = new ChooseQueue(
    'div.colosseum-deck',
    async (context: ActionContext) => {
      const { baseObj: frame } = context;
      const enabledCards = await frame.$$('div.cards-list div.cards-list__slot:not(.locked) div.item-container');
      console.log(`enabledCards length=${enabledCards.length}`)
      if (enabledCards.length <= slot) {
        return false;
      }
      return true;
    },
    new ActionQueue([setDeck(slot), attack, fightResult, getReward]),
    new ActionQueue([
      new Action('quite-slot', 'div.popup-layer.fullscreen.colosseum-deck', 'div.btn_round.icn_back.back'),
      new Action('quite-attack', 'div.popup,choose-rival', 'div.btn_round.icn_x-icon.close'),
      new SetEventFlat(NOT_ENOUPH_CARDS_IN_COLOSSEUM),
    ])
  );

  const loopQueue = new LoopActionQueue([
    collection, toys, removeAllToys, quiteToys,
    selectTarget(location), deploy, fight,
  ], times, NOT_ENOUPH_CARDS_IN_COLOSSEUM);
  return new ActionQueue([enterColosseum, loopQueue, quiteScreen]);
}

export { collection, doColosseum, toys, removeAllToys, quiteToys, fightLost }
