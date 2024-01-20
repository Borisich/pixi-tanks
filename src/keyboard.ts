export function keyboard(value: string) {
  const key: any = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = (event: any) => {
    if (event.key === key.value) {
      key.isDown = true;
      key.isUp = false;

      if (key.press) {
        key.press();
      }
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = (event: any) => {
    if (event.key === key.value) {
      key.isDown = false;
      key.isUp = true;

      if (key.release) {
        key.release();
      }

      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);

  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);

  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };

  return key;
}
