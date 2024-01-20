import * as PIXI from "pixi.js";
import { createTank } from "./tank";
import { hitTestRectangle } from "./hitTest";

const app = new PIXI.Application({
  background: "#1099bb",
  resizeTo: window,
});

document.body.appendChild(app.view as any);

const tank1 = createTank(app, {
  speed: 5,
  controls: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  },
});

const tank2 = createTank(app, {
  speed: 5,
  controls: {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
  },
});

tank1.others = [tank2];
tank2.others = [tank1];

tank1.x = tank1.width + 100;
tank1.y = tank1.height + 100;

tank2.x = tank2.width + 500;
tank2.y = tank2.height + 500;

console.log(tank1.width);

// tank2.x = app.screen.width - 100;
// tank2.y = app.screen.height - 100;

app.stage.addChild(tank1);
app.stage.addChild(tank2);

PIXI.Ticker.shared.add((delta) => {
  // console.log(hitTestRectangle(tank1, tank2));
  // console.log(tank1.width);
  // console.log(tank1.x);
  // console.log(tank1.height);
});
