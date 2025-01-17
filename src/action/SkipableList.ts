import { delay, isEnable } from "../utils";
import { Action, ActionContext, CanDo } from "./Action";

class SkipableList implements CanDo {
  actions: Action[];

  constructor(actions: Action[]) {
    this.actions = actions;
  }

  async doAction(context: ActionContext) {
    const { baseObj, nextSelector } = context;
    console.log(`wait skipable list`)
    let skiped = false;
    while (!skiped) {
      await delay();
      let enabledAction = null;
      let confirm = false;
      for (const action of this.actions) {
        const tagObj = await baseObj.$(action.selector);
        const tagObjEnable = await isEnable(tagObj);
        console.log(`skiplist test:${action.selector},tagObj=${tagObj},tagObjEnable=${tagObjEnable}`);
        if (tagObj && tagObjEnable) {
          if (action.code === 'check-new-colosseum' && !confirm) {
            confirm = true;
            await delay();
          } else {
            enabledAction = action;
            break; // 找到第一个符合条件的动作并退出循环
          }
        }
      }
      if (enabledAction) {
        console.log(`do skipable action =${enabledAction.code}`)
        await enabledAction.doAction(context);
      } else if (nextSelector) {
        const nextObj = await baseObj.$(nextSelector);
        const nextObjEnable = await isEnable(nextObj);
        console.log(`nextSelector=${nextSelector}, nextObj=${nextObj}, nextObjEnable=${nextObjEnable}`)
        if (nextObj && nextObjEnable) skiped = true;
      }
    }
    console.log(`wait skipable list success`)
  }

  getFirstSelector() {
    return undefined;
  }
}

export { SkipableList }
