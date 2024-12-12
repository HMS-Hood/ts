import { Frame } from "puppeteer";
import { Action } from "./Action";

/**
 * 自定义动作
 */
class CustomAction extends Action {
  act: (frame: Frame) => Promise<void>;

  constructor (code: string, selector: string, act: (frame: Frame) => Promise<void>) {
    super(code, selector);
    this.act = act;
  }

  async doAction(baseObj: Frame) {
    await this.act(baseObj);
  }
}

export { CustomAction }
