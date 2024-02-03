import * as PIXI from "pixi.js";

export function createExplotion(
  app: PIXI.Application,
  options: {
    position: {
      x: number;
      y: number;
    };
  }
) {
  const { position } = options;

  const images = [1, 2, 3, 4, 5, 6, 7].map((v) => `explotion/${v}.png`);

  const textureArray = [];

  for (const img of images) {
    const texture = PIXI.Texture.from(img);
    textureArray.push(texture);
  }

  const explotion = new PIXI.AnimatedSprite(textureArray);

  // center the sprite's anchor point
  explotion.anchor.set(0.5);

  explotion.x = position.x;
  explotion.y = position.y;

  // explode
  explotion.loop = false;
  explotion.animationSpeed = 0.4;
  explotion.onComplete = () => {
    explotion.destroy();
  };

  app.stage.addChild(explotion);
  explotion.play();
}
