import * as PIXI from "pixi.js";
import { Tank } from "./tank";
import { createBullet } from "../bullet";

export function onFire(app: PIXI.Application, tank: Tank) {
  const now = new Date().getTime();

  if (
    tank.data.lastFireMs &&
    now - tank.data.lastFireMs < (1 / tank.data.fireFreq) * 1000
  ) {
    return;
  }

  tank.data.lastFireMs = now;

  createBullet(app, {
    speed: 10 + tank.data.bulletSpeed * 5,
    direction: tank.angle,
    position: adjustBulletPosition(tank),
    damage: tank.data.damage,
  });
}

function adjustBulletPosition(tank: Tank) {
  const d = tank.height / 2 + 40;
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

  throw new Error("Bad angle");
}
