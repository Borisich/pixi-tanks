import * as PIXI from "pixi.js";

export function checkCollision(app: PIXI.Application, obj: PIXI.Sprite) {
  if (
    obj.x < 40 ||
    obj.y < 40 ||
    obj.x > app.screen.width - 40 ||
    obj.y > app.screen.height - 40
  ) {
    return "screen";
  }

  for (const o of app.stage.children.filter(
    (c) => !!(c as any).type && c.visible
  )) {
    if (obj !== o && hitTestRectangle(obj, o)) {
      return o;
    }
  }

  return false;
}

export function hitTestRectangle(r1: any, r2: any) {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  const r1H = isRotated(r1) ? r1.width : r1.height;
  const r2H = isRotated(r2) ? r2.width : r2.height;

  const r1W = isRotated(r1) ? r1.height : r1.width;
  const r2W = isRotated(r2) ? r2.height : r2.width;

  //Find the center points of each sprite
  r1.centerX = r1.x;
  r1.centerY = r1.y;
  r2.centerX = r2.x;
  r2.centerY = r2.y;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1W / 2;
  r1.halfHeight = r1H / 2;
  r2.halfWidth = r2W / 2;
  r2.halfHeight = r2H / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
}

function isRotated(s: any) {
  return s.angle === 90 || s.angle === 270;
}
