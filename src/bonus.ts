import * as PIXI from "pixi.js";
import { checkCollision } from "./hitTest";
import { getRandomCoords } from "./utils";
import { isTank } from "./type-guards";

const BONUS_EXISTS_SEC = 30;

export enum BonusType {
  Speed = "speed",
  Aid = "aid",
  FireFreq = "fireFreq",
  BulletSpeed = "bulletSpeed",
  Power = "power",
}

type BonusData = {
  bonusType: BonusType;
  value: number;
  addedAt: number;
  applyingTarget?: {
    x: number;
    y: number;
    progress: number; // 0- 100
  };
};

export type Bonus = PIXI.Sprite & { data: BonusData };

const texturesMap = {
  [BonusType.Speed]: "speed.png",
  [BonusType.Aid]: "aid.png",
  [BonusType.FireFreq]: "fire-freq.png",
  [BonusType.BulletSpeed]: "bullet-speed.png",
  [BonusType.Power]: "power.png",
};

function getBousValue(bonus: BonusType) {
  switch (bonus) {
    case BonusType.FireFreq:
      return 0.1;
    case BonusType.Aid:
    case BonusType.Speed:
      return 1;
    case BonusType.BulletSpeed:
      return 10;
    case BonusType.Power:
      return 1;
    default:
      return 0;
  }
}

export async function createBonus(
  app: PIXI.Application,
  options: {
    bonusType: BonusType;
  }
) {
  // Create a new texture
  const texture = await PIXI.Assets.load(
    `bonus/${texturesMap[options.bonusType]}`
  );
  const sprite = new PIXI.Sprite(texture);

  const bonus: Bonus = Object.assign(sprite, {
    data: {
      addedAt: new Date().getTime(),
      value: getBousValue(options.bonusType),
      bonusType: options.bonusType,
    },
  });

  bonus.anchor.set(0.5);
  bonus.scale.set(0.2, 0.2);

  setBonusPosition(app, bonus);

  app.stage.addChild(bonus);

  const process = (delta: number) => {
    if (bonus.data.applyingTarget) {
      // animate

      if (bonus.data.applyingTarget.progress >= 100) {
        unlink();
        return;
      }

      const dx = bonus.data.applyingTarget.x - bonus.x;
      const dy = bonus.data.applyingTarget.y - bonus.y;
      bonus.data.applyingTarget.progress += 10;

      bonus.x += dx / 10;
      bonus.y += dy / 10;
      bonus.scale.set(bonus.scale.x * 0.9, bonus.scale.y * 0.9);
      return;
    }

    const now = new Date().getTime();

    if (now - bonus.data.addedAt > BONUS_EXISTS_SEC * 1000) {
      unlink();
      return;
    }

    const collisionTarget = checkCollision(app, bonus);

    if (isTank(collisionTarget)) {
      collisionTarget.data.applyBonus?.({
        bonusType: bonus.data.bonusType,
        value: bonus.data.value,
      });

      bonus.data.applyingTarget = {
        x: collisionTarget.x,
        y: collisionTarget.y,
        progress: 0,
      };

      bonus.scale.set(0.4, 0.4);
    }
  };

  PIXI.Ticker.shared.add(process);

  const unlink = () => {
    PIXI.Ticker.shared.remove(process);
    bonus.destroy();
  };
}

function setBonusPosition(app: PIXI.Application, bonus: Bonus) {
  // bonus should not appear on tank

  while (true) {
    const pos = getRandomCoords(app);
    bonus.x = pos.x;
    bonus.y = pos.y;

    const collition = checkCollision(app, bonus);
    if (!collition) {
      break;
    }
  }
}
