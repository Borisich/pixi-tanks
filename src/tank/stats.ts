import * as PIXI from "pixi.js";
import { Tank } from "./tank";
import { BonusType, createBonusTexture } from "../bonus";

export function drawStats(tank: Tank) {
  const c = tank.children[0];
  c?.destroy();
  const maxW = 120;
  const heathPercent = tank.data.health / tank.data.maxHealth;

  const w = Math.round(maxW * heathPercent);

  const container = new PIXI.Container();

  // Health bar
  let healthBar = new PIXI.Graphics();
  // Add it to the stage to render
  healthBar.beginFill(getColor(heathPercent));
  healthBar.drawRect(-60, -100, w, 8);
  container.addChild(healthBar);

  // Bonuses
  const p = new PIXI.Container();
  let y = -110;
  for (const bonus of [
    BonusType.Power,
    BonusType.BulletSpeed,
    BonusType.FireFreq,
    BonusType.Speed,
    BonusType.Armor,
  ]) {
    y += 30;

    const f = getDataFieldByBonus(bonus);
    if (!f) {
      continue;
    }

    for (let i = 0; i < (tank.data[f] as number); i++) {
      const sprite = new PIXI.Sprite(createBonusTexture(bonus));
      sprite.scale.set(0.07, 0.07);
      sprite.x = -60 + i * 20;
      sprite.y = y;
      p.addChild(sprite);
    }
  }
  container.addChild(p);

  tank.addChild(container);
}

function getDataFieldByBonus(bonus: BonusType): keyof Tank["data"] | null {
  switch (bonus) {
    case BonusType.FireFreq:
      return "fireFreq";
    case BonusType.Aid:
      return null;
    case BonusType.Speed:
      return "speed";
    case BonusType.BulletSpeed:
      return "bulletSpeed";
    case BonusType.Power:
      return "damage";
    case BonusType.Armor:
      return "armor";
    default:
      return null;
  }
}

function getColor(value: number) {
  //value from 0 to 1
  var hue = (value * 120).toString(10);
  return ["hsl(", hue, ",100%,50%)"].join("");
}
