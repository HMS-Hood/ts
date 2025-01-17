import { Action, ActionContext, CanDo } from "./Action";

class SetEventFlat implements CanDo {
  eventFlagName: string;

  constructor(eventFlagName: string) {
    this.eventFlagName = eventFlagName;
  }

  async doAction(context: ActionContext) {
    context.eventFlag[this.eventFlagName] = true;
    console.log(`set event flag: ${this.eventFlagName} = ${context.eventFlag[this.eventFlagName]}`);
  }

  getFirstSelector() {
    return undefined;
  }
}

export { SetEventFlat }
