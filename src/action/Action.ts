import { Frame, WaitForSelectorOptions } from "puppeteer";
import { delay, isEnable } from "../utils";

type ActionContext = {
  baseObj: Frame,
  nextAction?: Action,
}

interface CanDo {
  doAction(context: ActionContext): Promise<void>;
  getFirstAction(): Action | undefined;
}

/**
 * 操作动作
 */
class Action implements CanDo {
  /**
   * 活动编码，唯一标识
   */
  code: string;

  /**
   * 等待判断选择器
   */  
  selector: string;

  /**
   * 点击判断选择器
   */
  clickSelector: string;

  subActions?: Action[];

  /**
   * 等待超时设置
   */
  waitTimeOutOption: WaitForSelectorOptions = { timeout: 30000 };

  constructor(code: string, selector: string, clickSelector?: string, subActions?: Action[]) {
    this.code = code;
    this.selector = selector;
    this.clickSelector = clickSelector??selector;
    this.subActions = subActions;
  }

  getFirstAction() {
    return this;
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
    let done = false;
    while (!success) {
      await delay();
      console.log(`do action try:${this.code}`)
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      const clickObj = await baseObj.$(this.clickSelector);
      const clickObjEnable = await isEnable(clickObj);
      if (tagObj && tagObjEnable && clickObj && clickObjEnable) {
        console.log(`do action try:1`)
        try {
          await clickObj.click();
        } catch(e) {
          console.log(e);
        }
        done = true;
        console.log(`do action success:${this.code}`)
      } else {
        console.log(`do action try:2`)
        if (done) success = true;
      }
    }
    if (this.subActions) {
      for (let i = 0; i < this.subActions.length; i++) {
        await this.subActions[i].doAction(context);
      } 
    }
  }
}

export { Action, CanDo }
export type { ActionContext }
