import { Frame } from "puppeteer";
import { Action, ActionContext } from "./action/Action";
import { LongWaitAction } from "./action/LongWaitAction";
import { TestAction } from "./action/TestAction";
import { adv, getChest, quiteScreen } from "./common";
import { SkipableAction } from "./action/SkipableAction";
import { LoopActionQueue } from "./action/LoopActionQueue";
import { ActionQueue } from "./action/ActionQueue";
import { SetEventFlat } from "./action/SetEventFlag";
import { ChoiseAction } from "./action/OptionalAction";
import { CustomAction } from "./action/CustomAction";
import { delay, getPoint, myUtil } from "./utils";
import { collection, quiteToys, removeAllToys, toys } from "./colosseum";


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

/**
 * confirm victory in tower
 */
const confirmTowerVictory = new LongWaitAction('confirm-tower-victory', 'ul.reward-box', 'ul.reward-box div.btn.blue');

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
  [stopTower, adv]
);



const doTower = (times: number = 1) => {
  const loopQueue = new LoopActionQueue([
    collectChest, fightTower, confirmTowerVictory, removeChest
  ], times, NO_CHEST_SLOT_IN_TOWER);
  return new ActionQueue([enterTower, collection, toys, removeAllToys, deck, setDeckToys, quiteToys, loopQueue, quiteScreen]);
}

export { doTower }
