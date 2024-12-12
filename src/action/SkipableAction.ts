import { Frame } from "puppeteer";
import { Action, ActionContext } from "./Action";
import { delay, isEnable } from "../utils";

/**
 * 直到下一个场景出现前，尝试执行
 */
class SkipableAction extends Action {
  
  async doAction(context: ActionContext) {
    const { baseObj, nextAction } = context;
    console.log(`wait action :${this.code}`)
    let success = false;
    while (!success) {
      await delay();
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      if (tagObj && tagObjEnable) {
        await this.doClick(context);
        success = true;
      } else if (nextAction) {
        const nextObj = await baseObj.$(nextAction.selector);
        const nextObjEnable = await isEnable(nextObj);
        if (nextObj && nextObjEnable) success = true;
      }
    }
    console.log(`wait action success:${this.code}`)
  }
}

export { SkipableAction }
