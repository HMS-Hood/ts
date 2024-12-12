import { Frame } from "puppeteer";
import { Action } from "./Action";

/**
 * 如果操作条件不满足，则直接跳过，不会等待条件满足。
 */
class TestAction extends Action {
  async doAction(baseObj: Frame) {
    console.log(`wait action :${this.code}`)
    await baseObj.waitForSelector(this.selector)
    console.log(`wait action success:${this.code}`)

    // 测试需要点击的对象是否存在，不存在则直接跳过
    const clickObj = await baseObj.$(this.clickSelector);
    if (clickObj) {
      this.doClick(baseObj);
    } 
  }
}

export { TestAction }
