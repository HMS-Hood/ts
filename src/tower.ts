import { Frame } from "puppeteer";
import { Action } from "./action/Action";
import { LongWaitAction } from "./action/LongWaitAction";
import { TestAction } from "./action/TestAction";
import { getChest } from "./common";
import { SkipableAction } from "./action/SkipableAction";


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
const removeChest = new SkipableAction('remove-chest', 'div.popup.tower-chest-open.remove', 'div.popup.tower-chest-open.remove div.btn.glow-red', 'div.tb-controls.league');

const doTower = async (frame: Frame, times: number = 1) => {
  await enterTower.doAction(frame);
  for (let i = 1; i <= times; i++) {
    await collectChest.doAction(frame);
    await fightTower.doAction(frame);
    await confirmTowerVictory.doAction(frame);
    await removeChest.doAction(frame);  
  }
}

export { doTower }
