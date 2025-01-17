import { WaitForSelectorOptions } from "puppeteer";
import { Action, ActionContext } from "./Action";
import { delay, isEnable } from "../utils";

/**
 * 直到下一个场景出现前，尝试执行
 */
class SkipableAction extends Action {
  waitTimeOutOption: WaitForSelectorOptions = { timeout: 120000 };
  
  async doAction(context: ActionContext) {
    const { baseObj, nextSelector } = context;
    console.log(`wait action :${this.code}`)
    let success, skiped = false;
    while (!success && !skiped) {
      await delay();
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      console.log(`tagObj=${tagObj}, tagObjEnable=${tagObjEnable}`)
      if (tagObj && tagObjEnable) {
        await this.doClick(context);
        success = true;
      } else if (nextSelector) {
        const nextObj = await baseObj.$(nextSelector);
        const nextObjEnable = await isEnable(nextObj);
        console.log(`nextSelector=${nextSelector}, nextObj=${nextObj}, nextObjEnable=${nextObjEnable}`)
        if (nextObj && nextObjEnable) skiped = true;
      }
    }
    if (!skiped && this.subActions) {
      for (let i = 0; i < this.subActions.length; i++) {
        await this.subActions[i].doAction(context);
      } 
    }
    console.log(`wait action success:${this.code}`)
  }
}

export { SkipableAction }
