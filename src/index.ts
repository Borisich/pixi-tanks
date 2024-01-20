import * as PIXI from "pixi.js";
import { createTank } from "./tank";

const app = new PIXI.Application({
  background: "#1099bb",
  resizeTo: window,
});

document.body.appendChild(app.view as any);

const tank1 = createTank(app, {
  speed: 10,
  fireFrec: 0.1,
  controls: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    fire: "/",
  },
});

const tank2 = createTank(app, {
  speed: 5,
  fireFrec: 0.1,
  controls: {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    fire: "q",
  },
});

const tank3 = createTank(app, {
  speed: 7,
  fireFrec: 0.1,
  controls: {
    up: "t",
    down: "g",
    left: "f",
    right: "h",
    fire: "r",
  },
});

tank1.x = tank1.width + 100;
tank1.y = tank1.height + 100;

tank2.x = tank2.width + 500;
tank2.y = tank2.height + 500;

tank3.x = tank3.width + 900;
tank3.y = tank3.height + 900;

console.log(tank1.width);

// tank2.x = app.screen.width - 100;
// tank2.y = app.screen.height - 100;

app.stage.addChild(tank1);
app.stage.addChild(tank2);
app.stage.addChild(tank3);

PIXI.Ticker.shared.add((delta) => {
  // console.log(hitTestRectangle(tank1, tank2));
  // console.log(tank1.width);
  // console.log(tank1.x);
  // console.log(tank1.height);
});
