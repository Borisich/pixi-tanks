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
}

type BonusData = {
  bonusType: BonusType;
  value: number;
  addedAt: number;
};

export type Bonus = PIXI.Sprite & { data: BonusData };

const texturesMap = {
  [BonusType.Speed]: "speed.png",
  [BonusType.Aid]: "aid.png",
  [BonusType.FireFreq]: "fire-freq.png",
  [BonusType.BulletSpeed]: "bullet-speed.png",
};

export async function createBonus(
  app: PIXI.Application,
  options: {
    bonusType: BonusType;
    value: number;
  } | null
) {
  if (!options) {
    return;
  }

  // Create a new texture
  const texture = await PIXI.Assets.load(
    `bonus/${texturesMap[options.bonusType]}`
  );
  const sprite = new PIXI.Sprite(texture);

  const bonus: Bonus = Object.assign(sprite, {
    data: {
      addedAt: new Date().getTime(),
      value: options.value,
      bonusType: options.bonusType,
    },
  });

  bonus.anchor.set(0.5);
  bonus.scale.set(0.2, 0.2);

  setBonusPosition(app, bonus);

  app.stage.addChild(bonus);

  const process = (delta: number) => {
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

      unlink();
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
