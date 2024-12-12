import { WaitForSelectorOptions } from "puppeteer";
import { Action } from "./Action";

/**
 * 长时间等待（120s）操作动作
 */
class LongWaitAction extends Action {
  waitTimeOutOption: WaitForSelectorOptions = { timeout: 120000 };
}

export { LongWaitAction }
