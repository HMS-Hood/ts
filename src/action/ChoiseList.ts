import { delay, isEnable } from "../utils";
import { Action, ActionContext, CanDo } from "./Action";

/**
 * 可选的动作列表
 */
class ChoiseList implements CanDo {
  actions: Action[];

  constructor(actions: Action[]) {
    this.actions = actions;
  }

  async doAction(context: ActionContext) {
    const { baseObj, nextSelector } = context;
    console.log(`wait ChoiseList`)
    let skiped = false;
    let success = false
    while (!skiped && !success) {
      await delay();
      let enabledAction = null;
      for (const action of this.actions) {
        const tagObj = await baseObj.$(action.selector);
        const tagObjEnable = await isEnable(tagObj);
        console.log(`skiplist test:${action.selector},tagObj=${tagObj},tagObjEnable=${tagObjEnable}`);
        if (tagObj && tagObjEnable) {
          enabledAction = action;
          break; // 找到第一个符合条件的动作并退出循环
        }
      }
      if (enabledAction) {
        console.log(`do skipable action =${enabledAction.code}`)
        await enabledAction.doAction(context);
        success = true;
      } else if (nextSelector) {
        const nextObj = await baseObj.$(nextSelector);
        const nextObjEnable = await isEnable(nextObj);
        console.log(`nextSelector=${nextSelector}, nextObj=${nextObj}, nextObjEnable=${nextObjEnable}`)
        if (nextObj && nextObjEnable) skiped = true;
      }
    }
    console.log(`wait ChoiseList success`)
  }

  getFirstSelector() {
    return undefined;
  }
}

export { ChoiseList }
