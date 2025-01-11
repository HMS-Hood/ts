import { Action, ActionContext } from "./Action";
import { delay, isEnable } from "../utils";

/**
 * 带有额外可选操作的操作，如果额外操作的条件未满足则直接执行主操作，如果满足额外条件则先执行额外操作
 * 再执行主操作
 */
class OptionalAction extends Action {
  choiseSelector: string;

  constructor (code: string, selector: string, clickSelector: string, choiseSelector: string) {
    super(code, selector, clickSelector);
    this.choiseSelector = choiseSelector;
  }

  async doAction(context: ActionContext) {
    const { baseObj } = context;
    await baseObj.waitForSelector(this.selector)
    console.log(`wait action success:${this.code}`)
    let success = false;
    let done = false;
    while (!success) {
      await delay();
      console.log(`do action try:${this.code}`)
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      const clickObj = await baseObj.$(this.clickSelector);
      const clickObjEnable = await isEnable(clickObj);
      const passObj = await baseObj.$(this.choiseSelector);
      const passObjEnable = await isEnable(passObj);
      if (tagObj && tagObjEnable && passObj && passObjEnable) {
        success = true;
        console.log(`do action success 2:${this.code}`)
      } else if (tagObj && tagObjEnable && clickObj && clickObjEnable) {
        console.log(`do action try 1`)
        try {
          await clickObj.click();
        } catch(e) {
          console.log(e);
        }
        done = true;
        console.log(`do action success:${this.code}`)
      } else {
        if (done) {
          success = true;
          console.log(`do action success 3:${this.code}`)
        } else {
          console.log(`next because: tagObj=${tagObj}, enable=${tagObjEnable}, clickObj=${clickObj},enable=${clickObjEnable}`)
        }
      }
    }
  }
}

export { OptionalAction as ChoiseAction }
