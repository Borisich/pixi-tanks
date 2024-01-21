import * as PIXI from "pixi.js";
import { createTank } from "./tank";
import { BonusType, createBonus } from "./bonus";
import { getRandomInt } from "./utils";

const BONUS_SPAWN_PERIOD_SEC = 10;

const app = new PIXI.Application({
  background: "#1099bb",
  resizeTo: window,
});

document.body.appendChild(app.view as any);

const tank1 = createTank(app, {
  speed: 3,
  fireFreq: 1,
  controls: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    fire: "/",
  },
  textureNumber: 0,
});

const tank2 = createTank(app, {
  speed: 3,
  fireFreq: 1,
  controls: {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    fire: "q",
  },
  textureNumber: 0,
});

const aiCnt = 5;

for (let i = 0; i < aiCnt; i++) {
  const t = createTank(app, {
    speed: 1,
    fireFreq: 1,
    health: 15,
    textureNumber: 1,
  });

  t.x = 200 + 200 * i;
  t.y = 1000;

  app.stage.addChild(t);
}

tank1.x = tank1.width + 100;
tank1.y = tank1.height + 100;

tank2.x = tank2.width + 500;
tank2.y = tank2.height + 500;

app.stage.addChild(tank1);
app.stage.addChild(tank2);

setInterval(() => {
  createBonus(app, getBonusParams());
}, 1000 * BONUS_SPAWN_PERIOD_SEC);

const bonusesFreq = {
  [BonusType.Speed]: 1,
  [BonusType.Aid]: 4,
  [BonusType.FireFreq]: 2,
  [BonusType.BulletSpeed]: 1,
};

const bA: BonusType[] = [];
for (const [type, n] of Object.entries(bonusesFreq)) {
  for (let i = 0; i < n; i++) {
    bA.push(type as BonusType);
  }
}

function getBonusParams(): {
  bonusType: BonusType;
  value: number;
} | null {
  if (getRandomInt(0, 10) < 2) {
    return null;
  }

  const bonus = bA[getRandomInt(0, bA.length - 1)];
  let value = 0;

  switch (bonus) {
    case BonusType.FireFreq:
      value = 0.1;
      break;
    case BonusType.Aid:
    case BonusType.Speed:
      value = 1;
      break;
    case BonusType.BulletSpeed:
      value = 10;
      break;
    default:
    //
  }

  return {
    bonusType: bonus,
    value,
  };
}
