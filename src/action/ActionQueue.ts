import { Frame } from "puppeteer";
import { Action, ActionContext, CanDo } from "./Action";

class ActionQueue implements CanDo {
  canDos: CanDo[];

  constructor(actions: CanDo[]) {
    this.canDos = actions;
  }

  getFirstAction(): Action | undefined {
    if (this.canDos.length === 0) return undefined;
    const [ firstCanDo ] = this.canDos;
    return firstCanDo.getFirstAction();
  }

  async doAction(context: ActionContext) {
    const { baseObj } = context;
    for (let i = 0; i < this.canDos.length; i++) {
      if (i === this.canDos.length - 1) {
        await this.canDos[i].doAction(context);
      } else {
        await this.canDos[i].doAction({ baseObj, nextAction: this.canDos[i + 1].getFirstAction() });
      }
    }
  }
}

export { ActionQueue }
