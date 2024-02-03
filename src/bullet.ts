import * as PIXI from "pixi.js";
import { checkCollision } from "./hitTest";
import { createExplotion } from "./explotion";
import { isBullet, isTank } from "./type-guards";
import { getDeltaBySpeed } from "./utils";

type BulletOptions = {
  speed: number;
  direction: number;
  damage: number;
  position: {
    x: number;
    y: number;
  };
};

type BulletParams = {
  type: "bullet";
  damage: number;
  vx: number;
  vy: number;
  unlink: () => void;
};

export type Bullet = PIXI.Sprite & { data: BulletParams };

export function createBullet(app: PIXI.Application, options: BulletOptions) {
  const bullet = init(options);

  const process = getProcess(bullet, app);

  PIXI.Ticker.shared.add(process);

  bullet.data.unlink = () => {
    PIXI.Ticker.shared.remove(process);
    bullet.destroy();
  };

  app.stage.addChild(bullet);
}

function init(options: BulletOptions) {
  const { speed, direction, position, damage } = options;

  // Create a new texture
  const texture = PIXI.Texture.from("bullet.png");
  const sprite = new PIXI.Sprite(texture);

  const bullet: Bullet = Object.assign(sprite, {
    data: {
      damage,
      type: "bullet" as const,
      vx: 0,
      vy: 0,
      unlink: () => {},
    },
  });

  (bullet as any).type = "bullet";

  // center the sprite's anchor point
  bullet.anchor.set(0.5);
  bullet.scale.set(0.2, 0.2);

  bullet.x = position.x;
  bullet.y = position.y;

  if (direction === 0) {
    bullet.data.vy = speed;
    bullet.angle = 90;
  }

  if (direction === 90) {
    bullet.data.vx = -speed;
    bullet.angle = 180;
  }

  if (direction === 180) {
    bullet.data.vy = -speed;
    bullet.angle = 270;
  }

  if (direction === 270) {
    bullet.data.vx = speed;
    bullet.angle = 0;
  }

  return bullet;
}

function getProcess(bullet: Bullet, app: PIXI.Application) {
  return (delta: number) => {
    if (bullet.data.vy) {
      bullet.y += getDeltaBySpeed(bullet.data.vy);
    } else if (bullet.data.vx) {
      bullet.x += getDeltaBySpeed(bullet.data.vx);
    }

    const collisionTarget = checkCollision(app, bullet);

    if (collisionTarget) {
      createExplotion(app, {
        position: { x: bullet.x, y: bullet.y },
      });

      bullet.data.unlink();
    }

    if (isBullet(collisionTarget)) {
      collisionTarget.data.unlink();
    }

    if (isTank(collisionTarget)) {
      const damage =
        bullet.data.damage * (1 / (collisionTarget.data.armor * 1.5 + 1));

      collisionTarget.data.health -= damage;

      if (collisionTarget.data.health <= 0) {
        collisionTarget.data.unlink();
      }
    }
  };
}
