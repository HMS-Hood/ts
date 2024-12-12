import { Frame } from "puppeteer";
import { Action, ActionContext } from "./Action";

/**
 * 自定义动作
 */
class CustomAction extends Action {
  act: (context: ActionContext) => Promise<void>;

  constructor (code: string, selector: string, act: (context: ActionContext) => Promise<void>) {
    super(code, selector);
    this.act = act;
  }

  async doAction(context: ActionContext) {
    await this.act(context);
  }
}

export { CustomAction }
