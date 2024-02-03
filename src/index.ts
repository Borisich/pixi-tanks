import * as PIXI from "pixi.js";
import { createTank } from "./tank/tank";
import { BonusType, createBonus } from "./bonus";
import { getRandomInt } from "./utils";

const BONUS_SPAWN_PERIOD_SEC = 3;

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
  position: {
    x: app.screen.width + -100,
    y: app.screen.height - 150,
  },
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
  position: {
    x: 100,
    y: app.screen.height - 150,
  },
});

const aiCnt = 1;

for (let i = 0; i < aiCnt; i++) {
  const t = createTank(app, {
    speed: 1,
    fireFreq: 1,
    health: 45,
    textureNumber: 1,
    position: {
      x: 700 + 200 * i,
      y: 150,
    },
  });
}

setInterval(() => {
  if (getRandomInt(0, 10) < 2) {
    return;
  }

  createBonus(app, { bonusType: getBonusType() });
}, 1000 * BONUS_SPAWN_PERIOD_SEC);

const bonusesFreq = {
  [BonusType.Speed]: 1,
  [BonusType.Aid]: 2,
  [BonusType.FireFreq]: 1,
  [BonusType.BulletSpeed]: 1,
  [BonusType.Power]: 1,
  [BonusType.Armor]: 1,
};

const bA: BonusType[] = [];
for (const [type, n] of Object.entries(bonusesFreq)) {
  for (let i = 0; i < n; i++) {
    bA.push(type as BonusType);
  }
}

function getBonusType(): BonusType {
  return bA[getRandomInt(0, bA.length - 1)];
}
