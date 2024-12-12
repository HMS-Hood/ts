import { ElementHandle, Frame, Page, Point } from "puppeteer";
import { Action } from "./action/Action";

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





let myUtil: Util;

const init = (page: Page, frame: Frame) => {
  myUtil = new Util(page, frame);
}

export { myUtil, init, delay, isEnable }
