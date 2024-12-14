import { Action } from "./action/Action";
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
const quiteScreen = new Action('quite-tower', 'div.screen__header', 'div.screen__header div.btn_round.icn_back')

export { adv, getChest, quiteScreen }
