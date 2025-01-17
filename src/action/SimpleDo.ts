import { Action, ActionContext, CanDo } from "./Action";

class SimpleDo implements CanDo {
  act: (context: ActionContext) => Promise<void>; 

  constructor(act: (context: ActionContext) => Promise<void>) {
    this.act = act;
  }

  async doAction(context: ActionContext) {
    await this.act(context);
  }
  getFirstSelector() {
    return undefined;
  }
}

export { SimpleDo }
