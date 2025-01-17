import { Action, ActionContext, CanDo } from "./Action";

class ActionQueue implements CanDo {
  canDos: CanDo[];
  
  constructor(actions: CanDo[]) {
    this.canDos = actions;
  }

  getFirstSelector() {
    if (this.canDos.length === 0) return undefined;
    const [ firstCanDo ] = this.canDos;
    return firstCanDo.getFirstSelector();
  }

  async doAction(context: ActionContext) {
    const { baseObj, eventFlag } = context;
    for (let i = 0; i < this.canDos.length; i++) {
      if (i === this.canDos.length - 1) {
        await this.canDos[i].doAction(context);
      } else {
        // context.nextAction = this.canDos[i+1].getFirstAction();
        await this.canDos[i].doAction({ ...context, nextSelector: this.canDos[i+1].getFirstSelector() });
      }
    }
  }
}

export { ActionQueue }
