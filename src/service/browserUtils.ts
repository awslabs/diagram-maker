import { Rectangle, Size } from 'diagramMaker/state/types';

export function getBrowserSize(): Size {
  const { documentElement } = document;

  let width = Math.max(
    document.body.scrollWidth,
    document.body.offsetWidth,
  );

  let height = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
  );

  if (documentElement) {
    width = Math.max(
      width,
      documentElement.scrollWidth,
      documentElement.offsetWidth,
      documentElement.clientWidth,
    );

    height = Math.max(
      height,
      documentElement.scrollHeight,
      documentElement.offsetHeight,
      documentElement.clientHeight,
    );
  }

  return { width, height };
}

export function getBrowserRectangle(): Rectangle {
  const position = {
    x: 0,
    y: 0,
  };

  return {
    position,
    size: getBrowserSize(),
  };
}
