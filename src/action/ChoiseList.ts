import { delay, isEnable } from "../utils";
import { Action, ActionContext, CanDo } from "./Action";

class ChoiseList implements CanDo {
  actions: Action[];

  constructor(actions: Action[]) {
    this.actions = actions;
  }

  async doAction(context: ActionContext) {
    const { baseObj, nextAction } = context;
    console.log(`wait skipable list`)
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
      } else if (nextAction) {
        const nextObj = await baseObj.$(nextAction.selector);
        const nextObjEnable = await isEnable(nextObj);
        console.log(`nextSelector=${nextAction.selector}, nextObj=${nextObj}, nextObjEnable=${nextObjEnable}`)
        if (nextObj && nextObjEnable) skiped = true;
      }
    }
    console.log(`wait skipable list success`)
  }

  getFirstAction(): Action | undefined {
    return undefined;
  }
}

export { ChoiseList }
