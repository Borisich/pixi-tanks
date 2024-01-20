import * as PIXI from "pixi.js";
import { checkCollision } from "./hitTest";

type BulletParams = {
  vx?: number;
  vy?: number;
  others?: PIXI.Sprite[];
};

type Bullet = PIXI.Sprite & BulletParams;

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

  const process = (delta: number) => {
    if (bullet.vy) {
      bullet.y += bullet.vy;
    } else if (bullet.vx) {
      bullet.x += bullet.vx;
    }

    if (checkCollision(app, bullet)) {
      t.remove(process);
      bullet.destroy();
    }
  };

  const t = PIXI.Ticker.shared.add(process);

  console.log(app);

  return bullet;
}
