import { Action } from "./action/Action";
import { LongWaitAction } from "./action/LongWaitAction";
import { OpenChestAction } from "./action/OpenChestAction";
import { SkipableAction } from "./action/SkipableAction";

/**
 * 广告
 */
const adv = new SkipableAction('adv', 'div.popup-layer.fullscreen', 'div.popup-layer.fullscreen div.btn_round.icn_x-icon.close');

/**
 * 打开宝箱
 */
const getChest = new OpenChestAction();

/**
 * 退出当前场景
 */
const quiteScreen = new Action('quite-screen', 'div.screen__header', 'div.screen__header div.btn_round.icn_back')

/**
 * confirm victory in tower
 */
const confirmVictory = new LongWaitAction('confirm--victory', 'ul.reward-box', 'ul.reward-box div.btn.blue');


export { adv, getChest, quiteScreen, confirmVictory }
