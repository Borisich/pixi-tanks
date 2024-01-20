import * as PIXI from "pixi.js";
import { checkCollision } from "./hitTest";
import { createExplotion } from "./explotion";
import { isBullet, isTank } from "./type-guards";

type BulletParams = {
  vx?: number;
  vy?: number;
  type?: "bullet";
  unlink?: () => void;
};

export type Bullet = PIXI.Sprite & BulletParams;

export function createBullet(
  app: PIXI.Application,
  options: {
    speed: number;
    direction: number;
    position: {
      x: number;
      y: number;
    };
  }
) {
  const { speed, direction, position } = options;

  // Create a new texture
  const texture = PIXI.Texture.from("bullet.png");

  const bullet: Bullet = new PIXI.Sprite(texture);
  bullet.type = "bullet";

  // center the sprite's anchor point
  bullet.anchor.set(0.5);
  bullet.scale.set(0.2, 0.2);

  bullet.x = position.x;
  bullet.y = position.y;

  if (direction === 0) {
    bullet.vy = speed;
    bullet.angle = 90;
  }

  if (direction === 90) {
    bullet.vx = -speed;
    bullet.angle = 180;
  }

  if (direction === 180) {
    bullet.vy = -speed;
    bullet.angle = 270;
  }

  if (direction === 270) {
    bullet.vx = speed;
    bullet.angle = 0;
  }

  const explode = () => {
    const explotion = createExplotion(app, {
      position: { x: bullet.x, y: bullet.y },
    });

    explotion.loop = false;
    explotion.animationSpeed = 0.4;
    explotion.onComplete = () => {
      explotion.destroy();
    };

    app.stage.addChild(explotion);
    explotion.play();

    bullet.unlink?.();
  };

  const process = (delta: number) => {
    if (bullet.vy) {
      bullet.y += bullet.vy;
    } else if (bullet.vx) {
      bullet.x += bullet.vx;
    }

    const collisionTarget = checkCollision(app, bullet);

    if (collisionTarget) {
      explode();
    }

    if (isBullet(collisionTarget)) {
      collisionTarget.unlink?.();
    }

    if (isTank(collisionTarget)) {
      collisionTarget.health--;

      if (collisionTarget.health <= 0) {
        collisionTarget.unlink?.();
      }
    }
  };

  PIXI.Ticker.shared.add(process);
  bullet.unlink = () => {
    PIXI.Ticker.shared.remove(process);
    bullet.destroy();
  };

  return bullet;
}
