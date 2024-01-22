import { Bullet } from "./bullet";
import { Tank } from "./tank";

export function isTank(v: any): v is Tank {
  if (typeof v !== "object") {
    return false;
  }

  return v.data?.type === "tank";
}

export function isBullet(v: any): v is Bullet {
  if (typeof v !== "object") {
    return false;
  }

  return v.data?.type === "bullet";
}
