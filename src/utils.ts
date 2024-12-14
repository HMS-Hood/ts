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

const getPoint = async (element: ElementHandle<Element>): Promise<Point | undefined> => {
  const boundingBox = await element.boundingBox();
  if (boundingBox) {
    // 计算点击坐标，假设你要点击 canvas 的中间
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y + boundingBox.height / 2;
    return { x, y }
  }
}

class Util {
  baseObj: Frame;
  page: Page;

  constructor(page: Page, frame: Frame) {
    this.page = page;
    this.baseObj = frame;
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

export { myUtil, init, delay, isEnable, getPoint }
