import * as PIXI from "pixi.js";
import { getHandlers } from "./controls";
import { Tank } from "./tank";

export function hunt(app: PIXI.Application, tank: Tank, target: Tank) {
  const closest: "x" | "y" =
    Math.abs(tank.x - target.x) > Math.abs(tank.y - target.y) ? "y" : "x";

  if (closest === "x") {
    huntX(app, tank, target);
  } else {
    huntY(app, tank, target);
  }
}

function huntX(app: PIXI.Application, tank: Tank, target: Tank) {
  const { onUp, onDown, onLeft, onRight, onFire, onStop } = getHandlers(
    app,
    tank
  );
  onStop();

  if (Math.abs(tank.x - target.x) > 50) {
    if (tank.x > target.x) {
      onLeft();
    } else {
      onRight();
    }
  } else {
    onStop();

    if (tank.y > target.y) {
      onUp();
    } else {
      onDown();
    }

    if (Math.abs(tank.y - target.y) < 800) {
      onStop();
      onFire();
    }
  }
}

function huntY(app: PIXI.Application, tank: Tank, target: Tank) {
  const { onUp, onDown, onLeft, onRight, onFire, onStop } = getHandlers(
    app,
    tank
  );
  onStop();

  if (Math.abs(tank.y - target.y) > 50) {
    if (tank.y > target.y) {
      onUp();
    } else {
      onDown();
    }
  } else {
    onStop();

    if (tank.x > target.x) {
      onLeft();
    } else {
      onRight();
    }

    if (Math.abs(tank.x - target.x) < 800) {
      onStop();
      onFire();
    }
  }
}
