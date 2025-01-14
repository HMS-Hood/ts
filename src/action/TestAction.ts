import { Action, ActionContext } from "./Action";

/**
 * 如果操作条件不满足，则直接跳过，不会等待条件满足。
 */
class TestAction extends Action {
  async doAction(context: ActionContext) {
    const { baseObj } = context;
    console.log(`wait action :${this.code}`)
    await baseObj.waitForSelector(this.selector)
    console.log(`wait action success:${this.code}`)

    // 测试需要点击的对象是否存在，不存在则直接跳过
    const clickObj = await baseObj.$(this.clickSelector);
    if (clickObj) {
      await this.doClick(context);
    } 
  }
}

export { TestAction }
