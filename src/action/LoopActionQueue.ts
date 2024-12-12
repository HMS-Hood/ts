import { Frame } from "puppeteer";
import { ActionQueue } from "./ActionQueue";
import { ActionContext, CanDo } from "./Action";

class LoopActionQueue extends ActionQueue {
  loopTimes: number;

  constructor(actions: CanDo[], loopTimes: number = 1) {
    super(actions);
    this.loopTimes = loopTimes; 
  }

  async doAction(context: ActionContext) {
    const { baseObj } = context;
    for (let i = 1; i <= this.loopTimes; i++) {
      for (let j = 0; j < this.canDos.length; j++) {
        console.log(`do loop queue: loop=${i}, no=${j}`)
        if (i === this.loopTimes && j === this.canDos.length - 1) {
          // 最后一次循环的最后一个元素
          await this.canDos[j].doAction(context)
        } else {
          if (j === this.canDos.length - 1) {
            // 除最后一次外的每次循环的最后一个元素，下一个元素为第一个元素
            await this.canDos[j].doAction({ baseObj, nextAction: this.canDos[0].getFirstAction() });
          } else {
            // 普通元素，下一个元素即为队列中的下一个元素
            await this.canDos[j].doAction({ baseObj, nextAction: this.canDos[j+1].getFirstAction() })
          }
        }
      }
    }
  }
}

export { LoopActionQueue }
