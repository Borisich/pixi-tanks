import { BonusType } from "../bonus";
import { checkCollision } from "../hitTest";
import * as PIXI from "pixi.js";
import { isTank } from "../type-guards";
import { getDeltaBySpeed, getRandomInt } from "../utils";
import { initControls } from "./controls";
import { hunt } from "./ai";
import { drawStats } from "./stats";

const MAX_SPEED = 5;
const MAX_BULLET_SPEED = 5;
const MAX_FIRE_FREQ = 5;
const MAX_DMG = 5;
const MAX_ARMOR = 5;

const AI_TARGET_DURATION_SEC = 30;

type TankOptions = {
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
  position: {
    x: number;
    y: number;
    angle?: number;
  };
};

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
  armor: number;

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

export function createTank(app: PIXI.Application, options: TankOptions) {
  const tank = init(options);

  let controlsUnlink: (() => void) | undefined;
  if (options.controls) {
    controlsUnlink = initControls(app, tank, options.controls);
  }

  const process = getProcess(tank, app);
  PIXI.Ticker.shared.add(process);

  tank.data.unlink = () => {
    PIXI.Ticker.shared.remove(process);
    controlsUnlink?.();
    tank.destroy();
  };

  tank.x = options.position.x;
  tank.y = options.position.y;
  tank.angle = 180;
  if (options.position.angle !== undefined) {
    tank.angle = options.position.angle;
  }

  app.stage.addChild(tank);

  return tank;
}

function getProcess(tank: Tank, app: PIXI.Application) {
  return (delta: number) => {
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

      hunt(app, tank, target);

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
      drawStats(tank);

      tank.data.lastHelth = tank.data.health;
    }

    if (!tank.data.vy && !tank.data.vx) {
      return;
    }

    const prevX = tank.x;
    const prevY = tank.y;

    if (tank.data.vy) {
      tank.y += getDeltaBySpeed(tank.data.vy);
    } else if (tank.data.vx) {
      tank.x += getDeltaBySpeed(tank.data.vx);
    }

    if (checkCollision(app, tank)) {
      tank.x = prevX;
      tank.y = prevY;
    }
  };
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
        tank.data.fireFreq += option.value;
        if (tank.data.fireFreq > MAX_FIRE_FREQ) {
          tank.data.fireFreq = MAX_FIRE_FREQ;
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
      case BonusType.Armor: {
        tank.data.armor += option.value;
        if (tank.data.armor > MAX_ARMOR) {
          tank.data.armor = MAX_ARMOR;
        }

        break;
      }
      default:
      //
    }

    drawStats(tank);
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

function init(options: TankOptions) {
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
      armor: 0,
      bulletSpeed: 1,
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

  return tank;
}
