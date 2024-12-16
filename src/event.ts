import { ElementHandle, Frame } from "puppeteer";
import { Action, ActionContext } from "./action/Action";
import { ActionQueue } from "./action/ActionQueue";
import { CustomAction } from "./action/CustomAction";
import { adv, confirmVictory, quiteScreen } from "./common";
import { delay, myUtil } from "./utils";
import { SimpleDo } from "./action/SimpleDo";

/**
 * enter event
 */
const enterEvent = new Action('enter-event', 'div.main-controls .dgrid .dgrid-item:nth-of-type(1) .ditem__img');

/**
 * 选择event boss
 * @param baseObj 
 * @param handle 
 * @param xPer 
 * @param yPer 
 */
const clickEventBoss = async (baseObj: Frame, handle: ElementHandle<Element>, xPer: number, yPer: number) => {
  const boundingBox = await handle.boundingBox();
  if (boundingBox) {
    // 计算点击坐标，中间偏左，即最左侧的目标
    const x = boundingBox.x + boundingBox.width * xPer;
    const y = boundingBox.y + boundingBox.height * yPer;

    let needClick = true;
    while(needClick) {
      // 在指定的 (x, y) 坐标上点击
      await myUtil.mouseClick(x, y);
      const cfSelector = await baseObj.$(confirmEventFight.selector);
      if (cfSelector) {
        needClick = false;
      } else {
        await delay(3000);
      }
    }
    console.log(`Clicked on canvas at (${x}, ${y})`);
  } else {
    console.error('Could not determine the bounding box of the canvas.');
  }
}

type BossLevel = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const bossInfo: Record<BossLevel, { xPer: number, yPer: number, length: number }> = {
  common: { xPer: 3/8, yPer: 1/3, length: 24 * 60 * 1000 },
  rare: { xPer: 2/3, yPer: 1/3, length: 48 * 60 * 1000 },
  epic: { xPer: 5/6, yPer: 2/3, length: 96 * 60 * 1000 },
  legendary: { xPer: 3/5, yPer: 2/3, length: 200 * 60 * 1000 },
  mythic: { xPer: 3/8, yPer: 2/3, length: 480 * 60 * 1000 },
}

let currentBoss: BossLevel;

const bossDate: Record<BossLevel, Date | undefined> = {
  common: undefined,
  rare: undefined,
  epic: undefined,
  legendary: undefined,
  mythic: undefined,
}

const initBossDate = (initParam: { [ k in BossLevel]?: number[] }) => {
  Object.entries(initParam).forEach(([key, value]) => {
    const [ time1, time2, time3 ] = value;
    let time = time1;
    if (time2 !== undefined) {
      time = time * 60 + time2;
    }
    if (time3 !== undefined) {
      time = time * 60 + time3;
    }
    time = time * 1000;
    (bossDate as any)[key] = new Date(new Date().getTime() + time);
    console.log(`set bose date:${(bossDate as any)[key]}`)
  })
}

const getExpireBoss = () => {
  const current = new Date();
  return Object.entries(bossDate).find(([, value]) => value && current.getTime() >= value?.getTime());
}

const beginEventFight = new CustomAction('begin-event-fight', 'div.game-screen.campaign-dungeons.event', async(context: ActionContext) => {
  // 等待 canvas 元素出现并获取其句柄
  const { baseObj } = context;

  let canvasHandle: ElementHandle<Element> | null = null;
  
  let expireBoss = getExpireBoss();
  
  while (expireBoss) {
    while (canvasHandle === null) {
      await delay();
      const advSelector = await baseObj.$(adv.selector);
      if (advSelector !== null) await adv.doAction(context);
      canvasHandle = await baseObj.$('#canvas-layer1');
    }
// 'popup monster-revive' 'grave__timer' 'btn_round icn_x-icon close'
    // 获取 canvas 元素的位置和尺寸
    console.log(`expireBoss=${expireBoss}, current=${new Date()}`)
    currentBoss = expireBoss[0] as any;
    
    const boundingBox = await canvasHandle.boundingBox();
    if (boundingBox) {
      // 计算点击坐标，中间偏左，即最左侧的目标
      const x = boundingBox.x + boundingBox.width * bossInfo[currentBoss].xPer;
      const y = boundingBox.y + boundingBox.height * bossInfo[currentBoss].yPer;

      let needClick = true;
      let nextBoss = false;
      while(needClick) {
        // 在指定的 (x, y) 坐标上点击
        await myUtil.mouseClick(x, y);
        await delay(3000);
        const reviveSelector = await baseObj.$('div.popup.monster-revive');
        if (reviveSelector) {
          const timer = await baseObj.$('div.popup.monster-revive div.grave__timer');
          const reviveTime = await timer?.evaluate(elemnt => elemnt.innerHTML);
          if (reviveTime) {
            const counts = reviveTime.split(":");
            let reviveTimeNum = 0;
            for (let i = 0; i < counts.length; i++) {
              reviveTimeNum = reviveTimeNum * 60 + parseInt(counts[i]);
            }
            bossDate[currentBoss] = new Date(new Date().getTime() + reviveTimeNum * 1000);
            console.log(`reset event boss time: boss=${currentBoss}, time=${reviveTimeNum}`);
            nextBoss = true;
            await new Action('close-revive-boss', 'div.popup.monster-revive', 'div.popup.monster-revive div.btn_round.icn_x-icon.close').doAction(context);
            break;
          }
        }
        
        const cfSelector = await baseObj.$(confirmEventFight.selector);
        if (cfSelector) {
          needClick = false;
        }
      }
      if (nextBoss) {
        expireBoss = getExpireBoss();
        continue;
      }
      console.log(`Clicked on canvas at (${x}, ${y})`);
    } else {
      console.error('Could not determine the bounding box of the canvas.');
    }

    await confirmEventFight.doAction(context);
    await confirmVictory.doAction(context);
    bossDate[currentBoss] = new Date(new Date().getTime() + bossInfo[currentBoss].length);
    console.log(`set boss date: level=${currentBoss}, date=${bossDate[currentBoss]}`);

    expireBoss = getExpireBoss();

    await adv.doAction({ ...context, nextAction: quiteScreen });
  }

});

const confirmEventFight = new Action('confirm-event-fight', 'div.popup.fight-intro', 'div.btn.blue.attack');

const doEvent = (times: number = 1) => {
  return new ActionQueue([ enterEvent, beginEventFight, adv, quiteScreen ]);
}

export { doEvent, initBossDate }
