import * as PIXI from "pixi.js";
import { checkCollision } from "./hitTest";
import { getRandomCoords } from "./utils";
import { isTank } from "./type-guards";

export enum BonusType {
  Speed = "speed",
  Aid = "aid",
  FireFreq = "fireFreq",
  BulletSpeed = "bulletSpeed",
}

type BonusData = {
  // type?: "bonus";
  bonusType?: BonusType;
  value?: number;
  addedAt?: number;
};

export type Bonus = PIXI.Sprite & BonusData;

const texturesMap = {
  [BonusType.Speed]: "speed.png",
  [BonusType.Aid]: "aid.png",
  [BonusType.FireFreq]: "fire-freq.png",
  [BonusType.BulletSpeed]: "bullet-speed.png",
};

export async function createBonus(
  app: PIXI.Application,
  options?: {
    bonusType: BonusType;
    value: number;
  }
) {
  if (!options) {
    return;
  }

  // Create a new texture
  const texture = await PIXI.Assets.load(
    `bonus/${texturesMap[options.bonusType]}`
  );
  const bonus: Bonus = new PIXI.Sprite(texture);

  // bonus.type = "bonus";
  bonus.addedAt = new Date().getTime();
  bonus.value = options.value;
  bonus.bonusType = options.bonusType;

  bonus.anchor.set(0.5);
  bonus.scale.set(0.2, 0.2);

  setBonusPosition(app, bonus);

  app.stage.addChild(bonus);

  const process = (delta: number) => {
    const now = new Date().getTime();

    if (now - bonus.addedAt > 10 * 1000) {
      unlink();
      return;
    }

    const collisionTarget = checkCollision(app, bonus);

    if (isTank(collisionTarget)) {
      collisionTarget.applyBonus?.({
        bonusType: bonus.bonusType,
        value: bonus.value,
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
