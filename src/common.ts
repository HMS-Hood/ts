import { Action } from "./action/Action";
import { OpenChestAction } from "./action/OpenChestAction";
import { SkipableAction } from "./action/SkipableAction";

/**
 * 广告
 */
const adv = new SkipableAction('adv', 'div.popup-layer.fullscreen', 'div.popup-layer.fullscreen div.btn_round.icn_x-icon.close', 'div.main-controls .dgrid');

/**
 * 打开宝箱
 */
const getChest = new OpenChestAction();

export { adv, getChest }
