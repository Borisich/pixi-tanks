import { BonusType } from "./bonus";
import { createBullet } from "./bullet";
import { checkCollision } from "./hitTest";
import { keyboard } from "./keyboard";
import * as PIXI from "pixi.js";
import { isTank } from "./type-guards";
import { getRandomInt } from "./utils";

const MAX_SPEED = 15;
const MAX_BULLET_SPEED = 70;

const AI_TARGET_DURATION_SEC = 40;

const MIN_FIRE_FREQ = 0.1;

const MAX_DMG = 5;

const AI_FREQ_SEC = 1;

type TankParams = {
  type: "tank";
  vx: number;
  vy: number;
  lastFireMs: number;

  speed: number;

  bulletSpeed: number;

  damage: number;

  maxHealth: number;
  health: number;

  fireFreq: number;

  unlink: () => void;

  lastHelth: number;
  lastAIActionMs: number;
  isAI: boolean;
  aiTarget?: Tank;
  aiTargetSelectedAtMs: number;

  applyBonus?: (option: { bonusType: BonusType; value: number }) => void;
};

const textures = ["tank.png", "tankBlue.png"];

export type Tank = PIXI.Sprite & { data: TankParams };

export function createTank(
  app: PIXI.Application,
  options: {
    speed: number;
    fireFreq: number;
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
  const { speed, controls, fireFreq, health } = options;

  // Create a new texture
  const texture = PIXI.Texture.from(textures[options.textureNumber]);

  const sprite = new PIXI.Sprite(texture);

  const tank: Tank = Object.assign(sprite, {
    data: {
      type: "tank" as const,
      vx: 0,
      vy: 0,
      damage: 1,
      health: health || 5,
      maxHealth: health || 5,
      lastHelth: 0,
      speed,
      bulletSpeed: 20,
      fireFreq,
      lastFireMs: 0,
      unlink: () => {},
      lastAIActionMs: 0,
      isAI: !controls,
      aiTargetSelectedAtMs: 0,
    },
  });

  tank.data.applyBonus = getApplyBonusHandler(tank);

  // center the sprite's anchor point
  tank.anchor.set(0.5);

  const onFire = () => {
    const now = new Date().getTime();

    if (
      tank.data.lastFireMs &&
      now - tank.data.lastFireMs < tank.data.fireFreq * 1000
    ) {
      return;
    }

    tank.data.lastFireMs = now;

    const bullet = createBullet(app, {
      speed: tank.data.bulletSpeed,
      direction: tank.angle,
      position: adjustBulletPosition(tank),
      damage: tank.data.damage,
    });
    app.stage.addChild(bullet);
  };

  const onUp = () => {
    if (tank.data.vx) {
      return;
    }

    tank.data.vy = -tank.data.speed;
    syncRotation(app, tank);
  };

  const onDown = () => {
    if (tank.data.vx) {
      return;
    }

    tank.data.vy = tank.data.speed;
    syncRotation(app, tank);
  };

  const onLeft = () => {
    if (tank.data.vy) {
      return;
    }

    tank.data.vx = -tank.data.speed;
    syncRotation(app, tank);
  };

  const onRight = () => {
    if (tank.data.vy) {
      return;
    }

    tank.data.vx = tank.data.speed;
    syncRotation(app, tank);
  };

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
  }

  function stop() {
    onUpRelease();
    onDownRelease();
    onLeftRelease();
    onRightRelease();
  }

  function hunt(target: Tank) {
    const closest: "x" | "y" =
      Math.abs(tank.x - target.x) > Math.abs(tank.y - target.y) ? "y" : "x";

    stop();

    if (closest === "x") {
      huntX(target);
    } else {
      huntY(target);
    }
  }

  function huntX(target: Tank) {
    if (Math.abs(tank.x - target.x) > 50) {
      if (tank.x > target.x) {
        onLeft();
      } else {
        onRight();
      }
    } else {
      stop();

      if (tank.y > target.y) {
        onUp();
      } else {
        onDown();
      }

      if (Math.abs(tank.y - target.y) < 800) {
        stop();
        onFire();
      }
    }
  }

  function huntY(target: Tank) {
    if (Math.abs(tank.y - target.y) > 50) {
      if (tank.y > target.y) {
        onUp();
      } else {
        onDown();
      }
    } else {
      stop();

      if (tank.x > target.x) {
        onLeft();
      } else {
        onRight();
      }

      if (Math.abs(tank.x - target.x) < 800) {
        stop();
        onFire();
      }
    }
  }

  const process = (delta: number) => {
    // AI Actions
    if (tank.data.isAI) {
      const now = new Date().getTime();
      // if (now - tank.data.lastAIActionMs > AI_FREQ_SEC * 1000) {
      tank.data.lastAIActionMs = now;

      if (
        !tank.data.aiTarget ||
        tank.data.aiTarget.destroyed ||
        now - tank.data.aiTargetSelectedAtMs > AI_TARGET_DURATION_SEC * 1000
      ) {
        selectTarget(app, tank);
        tank.data.aiTargetSelectedAtMs = now;
      }

      const target = tank.data.aiTarget;

      if (!target) {
        return;
      }

      hunt(target);

      // }

      // if (now - tank.data.lastAIActionMs > AI_FREQ_SEC * 1000) {
      //   tank.data.lastAIActionMs = now;

      //   onUpRelease();
      //   onDownRelease();
      //   onLeftRelease();
      //   onRightRelease();

      //   const m = Math.random();
      //   const f = Math.random();

      //   if (m < 0.25) {
      //     onUp();
      //   } else if (m < 0.5) {
      //     onDown();
      //   } else if (m < 0.75) {
      //     onLeft();
      //   } else {
      //     onRight();
      //   }

      //   if (f > 0.1) {
      //     onFire();
      //   }
      // }
    }

    if (tank.data.health !== tank.data.lastHelth) {
      drawHealthBar(tank);

      tank.data.lastHelth = tank.data.health;
    }

    if (!tank.data.vy && !tank.data.vx) {
      return;
    }

    const prevX = tank.x;
    const prevY = tank.y;

    if (tank.data.vy) {
      tank.y += tank.data.vy;
    } else if (tank.data.vx) {
      tank.x += tank.data.vx;
    }

    if (checkCollision(app, tank)) {
      tank.x = prevX;
      tank.y = prevY;
    }
  };

  PIXI.Ticker.shared.add(process);

  tank.data.unlink = () => {
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

  if (tank.angle !== 0 && tank.data.vy > 0) {
    tank.angle = 0;
  }

  if (tank.angle !== 180 && tank.data.vy < 0) {
    tank.angle = 180;
  }

  if (tank.angle !== 90 && tank.data.vx < 0) {
    tank.angle = 90;
  }

  if (tank.angle !== 270 && tank.data.vx > 0) {
    tank.angle = 270;
  }

  if (checkCollision(app, tank)) {
    tank.angle = prevAngle;
    tank.data.vx = 0;
    tank.data.vy = 0;
  }
}

function adjustBulletPosition(tank: Tank) {
  const d = tank.height / 2 + 10;
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

function drawHealthBar(tank: Tank) {
  const c = tank.children[0];
  c?.destroy();
  const maxW = 40;
  const heathPercent = tank.data.health / tank.data.maxHealth;

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

function getApplyBonusHandler(tank: Tank) {
  return (option: { bonusType: BonusType; value: number }) => {
    switch (option.bonusType) {
      case BonusType.Speed: {
        tank.data.speed += option.value;
        if (tank.data.speed > MAX_SPEED) {
          tank.data.speed = MAX_SPEED;
        }

        break;
      }
      case BonusType.Aid: {
        tank.data.health += option.value;
        if (tank.data.health > tank.data.maxHealth) {
          tank.data.health = tank.data.maxHealth;
        }

        break;
      }
      case BonusType.FireFreq: {
        tank.data.fireFreq -= option.value;
        if (tank.data.fireFreq < MIN_FIRE_FREQ) {
          tank.data.fireFreq = MIN_FIRE_FREQ;
        }

        break;
      }
      case BonusType.BulletSpeed: {
        tank.data.bulletSpeed += option.value;
        if (tank.data.bulletSpeed > MAX_BULLET_SPEED) {
          tank.data.bulletSpeed = MAX_BULLET_SPEED;
        }

        break;
      }
      case BonusType.Power: {
        tank.data.damage += option.value;
        if (tank.data.damage > MAX_DMG) {
          tank.data.damage = MAX_DMG;
        }

        break;
      }
      default:
      //
    }
  };
}

function selectTarget(app: PIXI.Application, tank: Tank) {
  const tanks = app.stage.children
    .filter(isTank)
    .filter((t) => !t.data.isAI && !t.destroyed);

  if (tanks.length === 0) {
    tank.data.aiTarget = undefined;
    return;
  }

  tank.data.aiTarget = tanks[getRandomInt(0, tanks.length - 1)];
}
