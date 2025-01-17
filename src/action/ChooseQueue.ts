import type { Action, ActionContext, CanDo } from "./Action";

/**
 * 根据选择条件判断结果二选一执行任务
 */
export class ChooseQueue implements CanDo {
  selector: string;
  choiseFun: (context: ActionContext) => Promise<boolean>;
  doWhenTrue: CanDo;
  doWhenFalse: CanDo;

  constructor(selector: string, choiseFun: (context: ActionContext) => Promise<boolean>, doWhenTrue: CanDo, doWhenFalse: CanDo) {
    this.selector = selector;
    this.choiseFun = choiseFun;
    this.doWhenTrue = doWhenTrue;
    this.doWhenFalse = doWhenFalse;
  }
  
  async doAction(context: ActionContext) {
    const { baseObj } = context;
    
    console.log(`wait ChooseQueue selector:${this.selector}`)
    await baseObj.waitForSelector(this.selector);
    console.log(`wait ChooseQueue selector success:${this.selector}`)

    const choiceFlag = await this.choiseFun(context);
    console.log(`choiceFlag=${choiceFlag}`);
    if (choiceFlag) {
      await this.doWhenTrue.doAction(context);
    } else {
      await this.doWhenFalse.doAction(context);
    }
  }

  getFirstSelector() {
    return this.selector;
  }
}