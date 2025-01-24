import { ElementHandle, Frame, Page } from "puppeteer";
import { Action, ActionContext } from "./action/Action";
import { ActionQueue } from "./action/ActionQueue";
import { CustomAction } from "./action/CustomAction";
import { adv, skipableAdv, quiteScreen, getChest } from "./common";
import { delay, myUtil } from "./utils";
import { LongWaitAction } from "./action/LongWaitAction";
import { TestAction } from "./action/TestAction";

// event-reward btn green
/**
 * enter event
 */
const enterEvent = new Action('enter-event', 'div.main-controls .dgrid .dgrid-item:nth-of-type(1) .ditem__img');

/**
 * open chest slots in tower
 */
const collectEventChest = new TestAction(
  'chest-list',
  'div.event-reward',
  'div.event-reward div.btn.green',
  [ getChest ]
);

type BossLevel = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

const bossInfo: Record<BossLevel, { xPer: number, yPer: number, length: number }> = {
  common: { xPer: 5/12, yPer: 1/3, length: 24 * 60 * 1000 },
  rare: { xPer: 11/20, yPer: 1/3, length: 48 * 60 * 1000 },
  epic: { xPer: 5/6, yPer: 2/3, length: 96 * 60 * 1000 },
  legendary: { xPer: 7/12, yPer: 2/3, length: 200 * 60 * 1000 },
  mythic: { xPer: 1/4, yPer: 2/3, length: 480 * 60 * 1000 },
}

let currentBoss: BossLevel;

const bossDate: Record<BossLevel, Date | null> = {
  common: null,
  rare: null,
  epic: null,
  legendary: null,
  mythic: null,
}

const confirmVictory = new LongWaitAction('confirm--victory', 'ul.reward-box', 'ul.reward-box div.btn.blue');

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

    await skipableAdv.doAction({ ...context, nextSelector: quiteScreen.selector });
  }

});

const confirmEventFight = new Action('confirm-event-fight', 'div.popup.fight-intro', 'div.btn.blue.attack');

const doEvent = (bossLevel: 1 | 2 | 3 | 4 | 5) => {
  switch(bossLevel) {
    case 5:
      bossDate.mythic = new Date();
    case 4:
      bossDate.legendary = new Date();
    case 3:
      bossDate.epic = new Date();
    case 2:
      bossDate.rare = new Date();
    case 1:
      bossDate.common = new Date();
  }
  return new ActionQueue([ enterEvent, collectEventChest, beginEventFight, quiteScreen ]);
}

export { doEvent }
