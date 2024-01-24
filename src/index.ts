import * as PIXI from "pixi.js";
import { createTank } from "./tank";
import { BonusType, createBonus } from "./bonus";
import { getRandomInt } from "./utils";

const BONUS_SPAWN_PERIOD_SEC = 2;

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

const aiCnt = 1;

for (let i = 0; i < aiCnt; i++) {
  const t = createTank(app, {
    speed: 1,
    fireFreq: 1,
    health: 25,
    textureNumber: 1,
  });

  t.x = 700 + 200 * i;
  t.y = 150;

  app.stage.addChild(t);
}

tank2.x = 100;
tank2.y = app.screen.height - 150;
tank2.angle = 180;

tank1.x = app.screen.width + -100; ///
tank1.y = app.screen.height - 150;
tank1.angle = 180;

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
  [BonusType.Power]: 6,
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
  if (getRandomInt(0, 10) < 6) {
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
    case BonusType.Power:
      value = 1;
      break;
    default:
    //
  }

  return {
    bonusType: bonus,
    value,
  };
}
