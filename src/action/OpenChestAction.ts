import { Action, ActionContext } from "./Action";
import { delay, isEnable } from "../utils";

/**
 * 打开箱子的操作，除了固定selector外，由于需要在同样的界面上点击两次同样的按钮，因此做特殊逻辑
 * 
 * 宝石 equip-box can-flip
 */
class OpenChestAction extends Action {
  constructor() {
    super('get-chest', 'div.gatcha-inside', 'div.gatcha-inside div.btn.blue');
  }

  async doAction(context: ActionContext) {
    const { baseObj } = context;
    console.log(`wait action :${this.code}`)
    await baseObj.waitForSelector(this.selector, this.waitTimeOutOption);
    console.log(`wait action success:${this.code}`)
    await this.doClick(context);
  }

  async doClick(context: ActionContext) {
    const { baseObj } = context;
    let success = false;
    while (!success) {
      await delay();
      console.log(`do open chest action try:${this.code}`)
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      const clickObj = await baseObj.$(this.clickSelector);
      const clickObjEnable = await isEnable(clickObj);
      if (tagObj && tagObjEnable && clickObj && clickObjEnable) {
        console.log(`do open chest action try:1`)
        try {
          await clickObj.click();
        } catch(e) {
          console.log(e);
        }
        console.log(`do open chest action success:${this.code}`)
      } else {
        console.log(`do aopen chest action try:2`)
        // 当外部条件不满足时才结束，正常情况下是执行2次点击操作
        if (!tagObj || !tagObjEnable) success = true;
      }
    }
    if (this.subActions) {
      for (let i = 0; i < this.subActions.length; i++) {
        await this.subActions[i].doAction(context);
      } 
    }
  }
}

export { OpenChestAction }
