import { Frame } from "puppeteer";
import { Action } from "./Action";
import { delay, isEnable } from "../utils";

/**
 * 直到下一个场景出现前，尝试执行
 */
class SkipableAction extends Action {
  nextSelector: string;

  constructor (code: string, selector: string, clickSelector: string, nextSelector: string) {
    super(code, selector, clickSelector);
    this.nextSelector = nextSelector;
  }
  
  async doAction(baseObj: Frame) {
    console.log(`wait action :${this.code}`)
    let success = false;
    while (!success) {
      await delay();
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      if (tagObj && tagObjEnable) {
        await this.doClick(baseObj);
        success = true;
      } else {
        const nextObj = await baseObj.$(this.nextSelector);
        const nextObjEnable = await isEnable(nextObj);
        if (nextObj && nextObjEnable) success = true;
      }
    }
    console.log(`wait action success:${this.code}`)
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

export { SkipableAction }
