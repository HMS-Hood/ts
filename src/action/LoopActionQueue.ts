import { ActionQueue } from "./ActionQueue";
import { ActionContext, CanDo } from "./Action";

class LoopActionQueue extends ActionQueue {
  loopTimes: number;
  breakEventFlag?: string;

  constructor(actions: CanDo[], loopTimes: number = 1, breakEventFlag?: string) {
    super(actions);
    this.loopTimes = loopTimes;
    this.breakEventFlag = breakEventFlag;
  }

  isBreak(context: ActionContext): boolean {
    console.log(`is break:eventFlag=${context.eventFlag}, ${context.eventFlag[this.breakEventFlag??'']}`)
    if (this.breakEventFlag !== undefined && context.eventFlag[this.breakEventFlag]) {
      return true;
    }
    return false;
  }

  resetBreakFlag(context: ActionContext) {
    if (this.breakEventFlag !== undefined && context.eventFlag[this.breakEventFlag]) {
      context.eventFlag[this.breakEventFlag] = false;
    }
  }

  async doAction(context: ActionContext) {
    const { baseObj, eventFlag } = context;
    for (let i = 1; i <= this.loopTimes; i++) {
      console.log(`do loop queue: loop=${i}, breakFlag=${this.breakEventFlag}`)
      if (this.breakEventFlag && this.isBreak(context)) {
        console.log(`to break`)
        this.resetBreakFlag(context);
        break;
      }
      for (let j = 0; j < this.canDos.length; j++) {
        console.log(`do loop queue: no=${j}`)
        if (i === this.loopTimes && j === this.canDos.length - 1) {
          // 最后一次循环的最后一个元素
          await this.canDos[j].doAction(context)
        } else {
          if (j === this.canDos.length - 1) {
            // 除最后一次外的每次循环的最后一个元素，下一个元素为第一个元素
            // context.nextAction = this.canDos[0].getFirstAction();
            await this.canDos[j].doAction({ ...context, nextAction: this.canDos[0].getFirstAction() });
          } else {
            // 普通元素，下一个元素即为队列中的下一个元素
            // context.nextAction = this.canDos[j+1].getFirstAction();
            await this.canDos[j].doAction({ ...context, nextAction: this.canDos[j+1].getFirstAction() })
          }
        }
      }
    }
  }
}

export { LoopActionQueue }
