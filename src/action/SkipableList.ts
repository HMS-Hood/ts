import { delay, isEnable } from "../utils";
import { Action, ActionContext, CanDo } from "./Action";

class SkipableList implements CanDo {
  actions: Action[];

  constructor(actions: Action[]) {
    this.actions = actions;
  }

  async doAction(context: ActionContext) {
    const { baseObj, nextAction } = context;
    console.log(`wait skipable list`)
    let success, skiped = false;
    while (!success && !skiped) {
      await delay();
      const enabledAction = this.actions.find(async action => {
        const tagObj = await baseObj.$(action.selector);
        const tagObjEnable = await isEnable(tagObj);
        return tagObj && tagObjEnable;
      })
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

export { SkipableList }
