import { ElementHandle, Frame, Page, Point } from "puppeteer";

const delay = (time: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

const isEnable = async (element: ElementHandle<Element> | null): Promise<boolean> => {
  if (element !== null) {
    return !(await element.isHidden());
  }
  return false;
}

class Util {
  baseObj: Frame;
  page: Page;

  constructor(page: Page, frame: Frame) {
    this.page = page;
    this.baseObj = frame;
  }

  async doActionWithOptional(optionalAction: Action, action: Action) {
    const promiseOpti = this.getPromise(optionalAction);
    const promise = this.getPromise(action);
    const result = await Promise.race([promiseOpti, promise]).catch((e) => {
      console.log(e);
    });
    if (result) {
      console.log(`do optional result:${result.code}`)
      if (result.code === optionalAction.code) {
        await optionalAction.doAction(this.baseObj);
        console.log(`do optional success:${optionalAction.code}`)
      } 
      await action.doAction(this.baseObj);
    }
  };

  getPromise(action: Action): Promise<{ code: string, handle: ElementHandle<Element> | null}> {
    return this.baseObj.waitForSelector(action.selector).then(res => ({
      code: action.code,
      handle: res,
    }));
  }

  mouseClick(x: number, y: number): Promise<void> {
    return this.page.mouse.click(x, y);
  }

  mouseDragAndDrop(start: Point, end: Point): Promise<void> {
    return this.page.mouse.dragAndDrop(start, end, { delay: 500 });
  }

  mouseMove(point: Point): Promise<void> {
    return this.page.mouse.move(point.x, point.y);
  }

  mouseUp(): Promise<void> {
    return this.page.mouse.up();
  }

  mouseDown(): Promise<void> {
    return this.page.mouse.down();
  }
}

/**
 * 操作动作
 */
class Action {
  /**
   * 活动编码，唯一标识
   */
  code: string;

  /**
   * 等待判断选择器
   */  
  selector: string;

  /**
   * 点击判断选择器
   */
  clickSelector: string;

  /**
   * 动作执行
   */
  act?: (frame: Frame) => Promise<void>;

  constructor(code: string, selector: string, clickSelector?: string) {
    this.code = code;
    this.selector = selector;
    this.clickSelector = clickSelector??selector;
  }

  async doAction(baseObj: Frame) {
    console.log(`wait action :${this.code}`)
    await baseObj.waitForSelector(this.selector)
    console.log(`wait action success:${this.code}`)
    let success = false;
    let done = false;
    while (!success) {
      await delay();
      console.log(`do action try:${this.code}`)
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      const clickObj = await baseObj.$(this.clickSelector);
      const clickObjEnable = await isEnable(clickObj);
      if (tagObj && tagObjEnable && clickObj && clickObjEnable) {
        console.log(`do action try:1`)
        try {
          await clickObj.click();
        } catch(e) {
          console.log(e);
        }
        done = true;
        console.log(`do action success:${this.code}`)
      } else {
        console.log(`do action try:2`)
        if (done) success = true;
      }
    }
  }
}

class ChoiseAction extends Action {
  choiseSelector: string;

  constructor (code: string, selector: string, clickSelector: string, choiseSelector: string) {
    super(code, selector, clickSelector);
    this.choiseSelector = choiseSelector;
  }

  async doAction(baseObj: Frame) {
    await baseObj.waitForSelector(this.selector)
    console.log(`wait action success:${this.code}`)
    let success = false;
    let done = false;
    while (!success) {
      await delay();
      console.log(`do action try:${this.code}`)
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      const clickObj = await baseObj.$(this.clickSelector);
      const clickObjEnable = await isEnable(clickObj);
      const passObj = await baseObj.$(this.choiseSelector);
      const passObjEnable = await isEnable(passObj);
      if (tagObj && tagObjEnable && passObj && passObjEnable) {
        success = true;
        console.log(`do action success 2:${this.code}`)
      } else if (tagObj && tagObjEnable && clickObj && clickObjEnable) {
        console.log(`do action try 1`)
        try {
          await clickObj.click();
        } catch(e) {
          console.log(e);
        }
        done = true;
        console.log(`do action success:${this.code}`)
      } else {
        if (done) {
          success = true;
          console.log(`do action success 3:${this.code}`)
        } else {
          console.log(`next because: tagObj=${tagObj}, enable=${tagObjEnable}, clickObj=${clickObj},enable=${clickObjEnable}`)
        }
      }
    }
  }
}

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

class LongAction extends Action {
  async doAction(baseObj: Frame) {
    console.log(`wait action :${this.code}`)
    await baseObj.waitForSelector(this.selector, { timeout: 90000 })
    console.log(`wait action success:${this.code}`)
    let success = false;
    let done = false;
    while (!success) {
      await delay();
      console.log(`do action try:${this.code}`)
      const tagObj = await baseObj.$(this.selector);
      const tagObjEnable = await isEnable(tagObj);
      const clickObj = await baseObj.$(this.clickSelector);
      const clickObjEnable = await isEnable(clickObj);
      if (tagObj && tagObjEnable && clickObj && clickObjEnable) {
        console.log(`do action try:1`)
        try {
          await clickObj.click();
        } catch(e) {
          console.log(e);
        }
        done = true;
        console.log(`do action success:${this.code}`)
      } else {
        console.log(`do action try:2`)
        if (done) success = true;
      }
    }
  }
}

class TestAction extends Action {
  async testAction(baseObj: Frame) {
    console.log(`wait action :${this.code}`)
    await baseObj.waitForSelector(this.selector)
    console.log(`wait action success:${this.code}`)
    const clickObj = await baseObj.$(this.clickSelector);
    if (clickObj) {
      let success = false;
      let done = false;
      while (!success) {
        await delay();
        console.log(`do action try:${this.code}`)
        const tagObj = await baseObj.$(this.selector);
        const tagObjEnable = await isEnable(tagObj);
        const clickObj = await baseObj.$(this.clickSelector);
        const clickObjEnable = await isEnable(clickObj);
        if (tagObj && tagObjEnable && clickObj && clickObjEnable) {
          console.log(`do action try:1`)
          try {
            await clickObj.click();
          } catch(e) {
            console.log(e);
          }
          done = true;
          console.log(`do action success:${this.code}`)
        } else {
          console.log(`do action try:2`)
          if (done) success = true;
        }
      }
      return true;
    } 
    return false;
  }
}

let myUtil: Util;

const init = (page: Page, frame: Frame) => {
  myUtil = new Util(page, frame);
}

export { myUtil, init, delay, Action, ChoiseAction, CustomAction, LongAction, TestAction }
