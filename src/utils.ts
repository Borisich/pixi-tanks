import * as PIXI from "pixi.js";

export function getRandomCoords(app: PIXI.Application, padding = 50) {
  return {
    x: getRandomInt(padding, app.screen.width - padding),
    y: getRandomInt(padding, app.screen.height - padding),
  };
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const screenWidth = window.innerWidth;

export function getDeltaBySpeed(speed: number) {
  return screenWidth * speed * 0.0003;
}
