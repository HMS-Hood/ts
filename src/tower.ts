import { Frame } from "puppeteer";
import { Action } from "./action/Action";
import { LongWaitAction } from "./action/LongWaitAction";
import { TestAction } from "./action/TestAction";
import { getChest } from "./common";
import { SkipableAction } from "./action/SkipableAction";
import { LoopActionQueue } from "./action/LoopActionQueue";
import { ActionQueue } from "./action/ActionQueue";


/**
 * enter tower
 */
const enterTower = new Action('enter-tower', 'div.main-controls .dgrid .dgrid-item:nth-of-type(5) .ditem__img');

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

/**
 * abondant chest
 */
const removeChest = new SkipableAction('remove-chest', 'div.popup.tower-chest-open.remove', 'div.popup.tower-chest-open.remove div.btn.glow-red');

const doTower = (times: number = 1) => {
  const loopQueue = new LoopActionQueue([
    collectChest, fightTower, confirmTowerVictory, removeChest
  ], times);
  return new ActionQueue([enterTower, loopQueue]);
}

export { doTower }
