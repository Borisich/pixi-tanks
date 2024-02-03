import * as PIXI from "pixi.js";
import { checkCollision } from "../hitTest";
import { Tank } from "./tank";
import { keyboard } from "../keyboard";
import { onFire } from "./helpers";

const SPEED_M = 1.5;

export function initControls(
  app: PIXI.Application,
  tank: Tank,
  controls: {
    up: string;
    down: string;
    left: string;
    right: string;
    fire: string;
  }
) {
  const onUpRelease = () => {
    tank.data.vy = 0;
    postRelease();
  };

  const onDownRelease = () => {
    tank.data.vy = 0;
    postRelease();
  };

  const onLeftRelease = () => {
    tank.data.vx = 0;
    postRelease();
  };

  const onRightRelease = () => {
    tank.data.vx = 0;
    postRelease();
  };

  const up = keyboard(controls.up);
  const down = keyboard(controls.down);
  const left = keyboard(controls.left);
  const right = keyboard(controls.right);
  const fire = keyboard(controls.fire);

  const { onFire, onUp, onDown, onLeft, onRight } = getHandlers(app, tank);

  fire.press = onFire;

  up.press = onUp;
  up.release = onUpRelease;

  down.press = onDown;
  down.release = onDownRelease;

  left.press = onLeft;
  left.release = onLeftRelease;

  right.press = onRight;
  right.release = onRightRelease;

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

  return () => {
    up.unsubscribe();
    down.unsubscribe();
    left.unsubscribe();
    right.unsubscribe();
    fire.unsubscribe();
  };
}

export function getHandlers(app: PIXI.Application, tank: Tank) {
  const onUp = () => {
    if (tank.data.vx) {
      return;
    }

    tank.data.vy = -tank.data.speed * SPEED_M;
    rotate(app, tank, 180);
  };

  const onDown = () => {
    if (tank.data.vx) {
      return;
    }

    tank.data.vy = tank.data.speed * SPEED_M;
    rotate(app, tank, 0);
  };

  const onLeft = () => {
    if (tank.data.vy) {
      return;
    }

    tank.data.vx = -tank.data.speed * SPEED_M;
    rotate(app, tank, 90);
  };

  const onRight = () => {
    if (tank.data.vy) {
      return;
    }

    tank.data.vx = tank.data.speed * SPEED_M;
    rotate(app, tank, 270);
  };

  const onStop = () => {
    tank.data.vy = 0;
    tank.data.vx = 0;
  };

  return {
    onUp,
    onDown,
    onLeft,
    onRight,
    onFire: () => onFire(app, tank),
    onStop,
  };
}

function rotate(app: PIXI.Application, tank: Tank, angle: number) {
  const prevAngle = tank.angle;

  tank.angle = angle;

  if (checkCollision(app, tank)) {
    tank.angle = prevAngle;
    tank.data.vx = 0;
    tank.data.vy = 0;
  }
}
