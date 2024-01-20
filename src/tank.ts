import { hitTestRectangle } from "./hitTest";
import { keyboard } from "./keyboard";
import * as PIXI from "pixi.js";

type TankParams = {
  vx?: number;
  vy?: number;
  others?: Tank[];
};

type Tank = PIXI.Sprite & TankParams;

export function createTank(
  app: PIXI.Application,
  options: {
    speed: number;
    controls: { up: string; down: string; left: string; right: string };
  }
) {
  const { speed, controls } = options;

  // Create a new texture
  const texture = PIXI.Texture.from("tank.png");

  const tank: Tank = new PIXI.Sprite(texture);

  // center the sprite's anchor point
  tank.anchor.set(0.5);

  const up = keyboard(controls.up);
  const down = keyboard(controls.down);
  const left = keyboard(controls.left);
  const right = keyboard(controls.right);

  up.press = () => {
    if (tank.vx) {
      return;
    }

    tank.vy = -speed;
    syncRotation(app, tank);
  };

  up.release = () => {
    tank.vy = 0;
    postRelease();
  };

  down.press = () => {
    if (tank.vx) {
      return;
    }

    tank.vy = speed;
    syncRotation(app, tank);
  };

  down.release = () => {
    tank.vy = 0;
    postRelease();
  };

  left.press = () => {
    if (tank.vy) {
      return;
    }

    tank.vx = -speed;
    syncRotation(app, tank);
  };

  left.release = () => {
    tank.vx = 0;
    postRelease();
  };

  right.press = () => {
    if (tank.vy) {
      return;
    }

    tank.vx = speed;
    syncRotation(app, tank);
  };

  right.release = () => {
    tank.vx = 0;
    postRelease();
  };

  PIXI.Ticker.shared.add((delta) => {
    if (!tank.vy && !tank.vx) {
      return;
    }

    const prevX = tank.x;
    const prevY = tank.y;

    if (tank.vy) {
      tank.y += tank.vy;
    } else if (tank.vx) {
      tank.x += tank.vx;
    }

    if (checkCollision(app, tank)) {
      tank.x = prevX;
      tank.y = prevY;
    }
  });

  function postRelease() {
    if (down.isDown) {
      down.press();
    }

    if (up.isDown) {
      up.press();
    }

    if (left.isDown) {
      left.press();
    }

    if (right.isDown) {
      right.press();
    }
  }

  return tank;
}

function checkCollision(app: PIXI.Application, tank: Tank) {
  if (
    tank.x < 40 ||
    tank.y < 40 ||
    tank.x > app.screen.width - 40 ||
    tank.y > app.screen.height - 40
  ) {
    return true;
  }

  for (const o of tank.others) {
    if (hitTestRectangle(tank, o)) {
      return true;
    }
  }

  return false;
}

function syncRotation(app: PIXI.Application, tank: Tank) {
  const prevAngle = tank.angle;

  if (tank.angle !== 0 && tank.vy > 0) {
    tank.angle = 0;
  }

  if (tank.angle !== 180 && tank.vy < 0) {
    tank.angle = 180;
  }

  if (tank.angle !== 90 && tank.vx < 0) {
    tank.angle = 90;
  }

  if (tank.angle !== 270 && tank.vx > 0) {
    tank.angle = 270;
  }

  if (checkCollision(app, tank)) {
    tank.angle = prevAngle;
    tank.vx = 0;
    tank.vy = 0;
  }
}
