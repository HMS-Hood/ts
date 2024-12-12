import { Frame, WaitForSelectorOptions } from "puppeteer";
import { delay, isEnable } from "../utils";

/**
 * 操作动作
 */
class Action {
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

  async doAction(baseObj: Frame) {
    console.log(`wait action :${this.code}`)
    await baseObj.waitForSelector(this.selector, this.waitTimeOutOption);
    console.log(`wait action success:${this.code}`)
    await this.doClick(baseObj);
  }

  async doClick(baseObj: Frame) {
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
    if (this.subActions) this.subActions.forEach(async action => {
      await action.doAction(baseObj);
    })
  }
}

export { Action }
