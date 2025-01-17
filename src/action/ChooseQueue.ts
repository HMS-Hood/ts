import type { Action, ActionContext, CanDo } from "./Action";

export class ChooseQueue implements CanDo {
  choiseFun: () => Promise<boolean>;
  doWhenTrue: CanDo;
  doWhenFalse: CanDo;

  constructor(choiseFun: () => Promise<boolean>, doWhenTrue: CanDo, doWhenFalse: CanDo) {
    this.choiseFun = choiseFun;
    this.doWhenTrue = doWhenTrue;
    this.doWhenFalse = doWhenFalse;
  }
  
  async doAction(context: ActionContext) {
    const choiceFlag = await this.choiseFun();
    if (choiceFlag) {
      await this.doWhenTrue.doAction(context);
    } else {
      await this.doWhenFalse.doAction(context);
    }
  }

  getFirstAction(): Action | undefined {
    return undefined;
  }
}