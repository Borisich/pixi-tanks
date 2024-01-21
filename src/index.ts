import * as PIXI from "pixi.js";
import { createTank } from "./tank";

const app = new PIXI.Application({
  background: "#1099bb",
  resizeTo: window,
});

document.body.appendChild(app.view as any);

const tank1 = createTank(app, {
  speed: 3,
  fireFrec: 0.1,
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
  fireFrec: 0.1,
  controls: {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    fire: "q",
  },
  textureNumber: 0,
});

const aiCnt = 7;

for (let i = 0; i < aiCnt; i++) {
  const t = createTank(app, {
    speed: 7,
    fireFrec: 0.1,
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
