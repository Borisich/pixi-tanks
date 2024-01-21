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
  maxHealth?: number;
  health?: number;
  lastHelth?: number;
  lastAIActionMs?: number;
  isAI?: boolean;
};

const textures = ["tank.png", "tankBlue.png"];

const aiFreq = 300;

export type Tank = PIXI.Sprite & TankParams;

export function createTank(
  app: PIXI.Application,
  options: {
    speed: number;
    fireFrec: number;
    controls?: {
      up: string;
      down: string;
      left: string;
      right: string;
      fire: string;
    };
    health?: number;
    textureNumber: number;
  }
) {
  const { speed, controls, fireFrec, health } = options;

  // Create a new texture
  const texture = PIXI.Texture.from(textures[options.textureNumber]);

  const tank: Tank = new PIXI.Sprite(texture);
  tank.type = "tank";
  tank.health = health || 5;
  tank.maxHealth = tank.health;

  // center the sprite's anchor point
  tank.anchor.set(0.5);

  const onFire = () => {
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

  const onUp = () => {
    if (tank.vx) {
      return;
    }

    tank.vy = -speed;
    syncRotation(app, tank);
  };

  const onDown = () => {
    if (tank.vx) {
      return;
    }

    tank.vy = speed;
    syncRotation(app, tank);
  };

  const onLeft = () => {
    if (tank.vy) {
      return;
    }

    tank.vx = -speed;
    syncRotation(app, tank);
  };

  const onRight = () => {
    if (tank.vy) {
      return;
    }

    tank.vx = speed;
    syncRotation(app, tank);
  };

  const onUpRelease = () => {
    tank.vy = 0;
    postRelease();
  };

  const onDownRelease = () => {
    tank.vy = 0;
    postRelease();
  };

  const onLeftRelease = () => {
    tank.vx = 0;
    postRelease();
  };

  const onRightRelease = () => {
    tank.vx = 0;
    postRelease();
  };

  let up: any, down: any, left: any, right: any, fire: any;

  if (controls) {
    up = keyboard(controls.up);
    down = keyboard(controls.down);
    left = keyboard(controls.left);
    right = keyboard(controls.right);
    fire = keyboard(controls.fire);

    fire.press = onFire;

    up.press = onUp;
    up.release = onUpRelease;

    down.press = onDown;
    down.release = onDownRelease;

    left.press = onLeft;
    left.release = onLeftRelease;

    right.press = onRight;
    right.release = onRightRelease;
  } else {
    tank.isAI = true;
    tank.lastAIActionMs = 0;
  }

  const process = (delta: number) => {
    const now = new Date().getTime();
    if (tank.isAI && now - tank.lastAIActionMs > aiFreq) {
      console.log("here");
      tank.lastAIActionMs = now;

      onUpRelease();
      onDownRelease();
      onLeftRelease();
      onRightRelease();

      const m = Math.random();
      const f = Math.random();

      if (m < 0.25) {
        onUp();
      } else if (m < 0.5) {
        onDown();
      } else if (m < 0.75) {
        onLeft();
      } else {
        onRight();
      }

      if (f > 0.3) {
        onFire();
      }
    }

    if (tank.health !== tank.lastHelth) {
      drawHealthBar(tank);

      tank.lastHelth = tank.health;
    }

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
    up?.unsubscribe();
    down?.unsubscribe();
    left?.unsubscribe();
    right?.unsubscribe();
    fire?.unsubscribe();
    tank.destroy();
  };

  function postRelease() {
    if (down?.isDown) {
      onDown();
    }

    if (up?.isDown) {
      onUp();
    }

    if (left?.isDown) {
      onLeft();
    }

    if (right?.isDown) {
      onRight();
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

function drawHealthBar(tank: Tank) {
  const c = tank.children[0];
  c?.destroy();
  const maxW = 40;
  const heathPercent = tank.health / tank.maxHealth;

  const w = Math.round(maxW * heathPercent);

  let obj = new PIXI.Graphics();

  // Add it to the stage to render
  tank.addChild(obj);

  obj.beginFill(getColor(heathPercent));
  obj.drawRect(-21, -40, w, 8);
}

function getColor(value: number) {
  //value from 0 to 1
  var hue = (value * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
}
