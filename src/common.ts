import { Action } from "./action/Action";
import { OpenChestAction } from "./action/OpenChestAction";
import { SkipableAction } from "./action/SkipableAction";

/**
 * 广告
 */
const adv = new Action('adv', 'div.popup-layer.fullscreen div.popup.offer-girl div.btn_round.icn_x-icon.close', 'div.popup-layer.fullscreen div.popup.offer-girl div.btn_round.icn_x-icon.close');

const skipableAdv = new SkipableAction('skipable-adv', 'div.popup-layer.fullscreen div.popup.offer-girl div.btn_round.icn_x-icon.close', 'div.popup-layer.fullscreen div.popup.offer-girl div.btn_round.icn_x-icon.close');

const newSlotAdv = new Action('new-slot-adv', 'div.popup-layer.fullscreen div.popup.new-slot div.btn_round.icn_x-icon.close', 'div.popup-layer.fullscreen div.popup.new-slot div.btn_round.icn_x-icon.close');
/**
 * 打开宝箱
 */
const getChest = new OpenChestAction();

/**
 * 退出当前场景
 */
const quiteScreen = new Action('quite-screen', 'div.screen__header', 'div.screen__header div.btn_round.icn_back')


export { adv, skipableAdv, newSlotAdv, getChest, quiteScreen }
