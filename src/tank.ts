import { createBullet } from "./bullet";
import { checkCollision } from "./hitTest";
import { keyboard } from "./keyboard";
import * as PIXI from "pixi.js";

type TankParams = {
  vx?: number;
  vy?: number;
  type?: "tank";
  lastFireMs?: number;
  unlink?: () => void;
};

type Tank = PIXI.Sprite & TankParams;

export function createTank(
  app: PIXI.Application,
  options: {
    speed: number;
    fireFrec: number;
    controls: {
      up: string;
      down: string;
      left: string;
      right: string;
      fire: string;
    };
  }
) {
  const { speed, controls, fireFrec } = options;

  // Create a new texture
  const texture = PIXI.Texture.from("tank.png");

  const tank: Tank = new PIXI.Sprite(texture);
  tank.type = "tank";

  // center the sprite's anchor point
  tank.anchor.set(0.5);

  const up = keyboard(controls.up);
  const down = keyboard(controls.down);
  const left = keyboard(controls.left);
  const right = keyboard(controls.right);
  const fire = keyboard(controls.fire);

  fire.press = () => {
    const now = new Date().getTime();

    if (tank.lastFireMs && now - tank.lastFireMs < fireFrec * 1000) {
      return;
    }

    tank.lastFireMs = now;

    const bullet = createBullet(app, {
      speed: 30,
      direction: tank.angle,
      position: adjustBulletPosition(tank),
    });
    app.stage.addChild(bullet);
  };

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

  const process = (delta: number) => {
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
  };

  PIXI.Ticker.shared.add(process);

  tank.unlink = () => {
    PIXI.Ticker.shared.remove(process);
    up.unsubscribe();
    down.unsubscribe();
    left.unsubscribe();
    right.unsubscribe();
    fire.unsubscribe();
    tank.destroy();
  };

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

function adjustBulletPosition(tank: Tank) {
  const d = 100;
  switch (tank.angle) {
    case 0:
      return {
        x: tank.x,
        y: tank.y + d,
      };
    case 90:
      return {
        x: tank.x - d,
        y: tank.y,
      };

    case 180:
      return {
        x: tank.x,
        y: tank.y - d,
      };
    case 270:
      return {
        x: tank.x + d,
        y: tank.y,
      };
  }
}
