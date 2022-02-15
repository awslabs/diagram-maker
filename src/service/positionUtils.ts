import clamp from 'lodash-es/clamp';

import { Position, Rectangle, Size } from 'diagramMaker/state/types';

/**
 * Finds a center point within a Bezier curve
 * https://stackoverflow.com/questions/5634460/quadratic-b%C3%A9zier-curve-calculate-points#5634528
 * @param {Position} src
 * @param {Position} dest
 * @param {Position} control
 * @return {Position} The center Position
 */
export function getCenterCoordinateForCurve(src: Position, dest: Position, control: Position) {
  const t = 0.5;
  const x = ((1 - t) * (1 - t) * (src.x)) + (2 * (1 - t) * t * control.x) + (t * t * dest.x);
  const y = ((1 - t) * (1 - t) * (src.y)) + (2 * (1 - t) * t * control.y) + (t * t * dest.y);
  return { x, y };
}

/**
 * Finds the center between two position objects.
 * @param {Position} firstPosition
 * @param {Position} secondPosition
 * @return {Position} The center position object
 */
export function getMidpoint(firstPosition: Position, secondPosition: Position): Position {
  return {
    x: (firstPosition.x + secondPosition.x) / 2,
    y: (firstPosition.y + secondPosition.y) / 2,
  };
}

/**
 * Finds point to draw curve between two position objects
 * @param {Position} firstPosition
 * @param {Position} secondPosition
 * @return {Position} The inflection point position object
 */
export function getInflectionPoint(firstPosition: Position, secondPosition: Position): Position {
  const { x: midX, y: midY } = getMidpoint(firstPosition, secondPosition);
  const distanceX = midX - secondPosition.x;
  const distanceY = midY - secondPosition.y;

  // Q = Inflection point = (-distanceY, distanceX)
  // startingX (Qx)
  // -distanceY = Qx - midX
  // Qx = midX - distanceY
  const startingX = midX - distanceY;

  // startingY (Qy)
  // distanceX = Qy - Py (midY)
  // distanceX + midY = Qy
  const startingY = midY + distanceX;

  return {
    x: startingX,
    y: startingY,
  };
}

/**
 * Returns the current scroll position.
 * @return {Position} The current scroll position.
 */
export function getScrollPosition(): Position {
  return {
    x: window.pageXOffset,
    y: window.pageYOffset,
  };
}

/**
 * Adds two position objects.
 * Keep in mind that one of the positions should be of the entity that the other position is relative to.
 * For example: firstPosition is position of A relative to B & secondPosition is position of
 * B relative to C, then this function returns position of A relative to C.
 * @param {Position} firstPosition
 * @param {Position} secondPosition
 * @return {Position} The added position object.
 */
export function add(firstPosition: Position, secondPosition: Position): Position {
  return {
    x: firstPosition.x + secondPosition.x,
    y: firstPosition.y + secondPosition.y,
  };
}

/**
 * Subtracts the second position object from the first.
 * Keep in mind that both positions should be relative to the same entity.
 * For example: firstPosition is position of A relative to C & secondPosition is position of
 * B relative to C, then this function returns position of A relative to B.
 * @param {Position} firstPosition
 * @param {Position} secondPosition
 * @return {Position} The subtracted position object.
 */
export function subtract(firstPosition: Position, secondPosition: Position): Position {
  return {
    x: firstPosition.x - secondPosition.x,
    y: firstPosition.y - secondPosition.y,
  };
}

/**
 * Converts an object returned by getBoundingClientRect from screen relative coordiantes to
 * page/document relative coordinates.
 * @param {ClientRect | DOMRect} screenRect - An object returned by getBoundingClientRect
 * @return {Position} The position relative to the page/document.
 */
export function fromScreenToPage(screenRect: ClientRect | DOMRect): Position {
  const screenPosition = { x: screenRect.left, y: screenRect.top };
  return add(screenPosition, getScrollPosition());
}

/**
 * Converts a position relative to the page/document to a position relative to the screen.
 * Relies on the current scroll position.
 * @param {Position} pagePosition - position relative to the page/document
 * @return {Position} The position relative to the screen.
 */
export function fromPageToScreen(pagePosition: Position): Position {
  return subtract(pagePosition, getScrollPosition());
}

/**
 * Converts a position relative to the page/document to a position relative to the container.
 * Relies on container's position relative to the page/document.
 * @param {Position} pagePosition - position relative to page/document
 * @param {Position} contextOffset - position of container relative to page/document
 * @return {Position} The position relative to the container.
 */
export function fromPageToContainer(pagePosition: Position, contextOffset: Position): Position {
  return subtract(pagePosition, contextOffset);
}

/**
 * Converts a position relative to the container to a position relative to page/document.
 * Relies on container's position relative to the page/document.
 * @param {Position} contextPosition - position relative to container
 * @param {Position} contextOffset - position of container relative to page/document
 * @return {Position} The position relative to the page/document.
 */
export function fromContainerToPage(contextPosition: Position, contextOffset: Position): Position {
  return add(contextPosition, contextOffset);
}

/**
 * Returns the centered position inside the container.
 * @param {Position} topLeftPosition - Position of the top left edge of the container
 * @param {Size} size - Size of the container
 * @return {Position} Position for the center of the container
 */
export function getCenteredPosition(topLeftPosition: Position, size: Size) {
  return { x: topLeftPosition.x - (size.width / 2), y: topLeftPosition.y - (size.height / 2) };
}

function isBetween(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Returns true if the given position is within the given rectangle
 * @param {Position} position - the position which much be in the rectangle
 * @param {Rectangle} rectange - the rectangle which must contain the position
 * @return {boolean} indicates whether the position is inside of the rectangle
 */
export function isPositionInRectangle(position: Position, rectange: Rectangle): boolean {
  const { x, y } = position;
  const left = rectange.position.x;
  const right = left + rectange.size.width;
  const top = rectange.position.y;
  const bottom = top + rectange.size.height;

  return isBetween(x, left, right)
      && isBetween(y, top, bottom);
}
/**
 * Returns a position which is based off of innerRectangle's position but is modified so that
 * the etirety of the innerRectangle fits inside of the boundingRectangle if possible.
 *
 * The difference between the returned position and innerRectangle.position should be as
 * small as possible while still constraining the innerRectangle within the boundingRectangle.
 *
 * If the innerRectangle is already fully within the boundingRectangle, the returned position
 * is the same as innerRectangle.position.
 *
 * @param {Rectangle} innerRectangle - the rectangle which we need to fit inside of the boundingRectangle
 * @param {Rectangle} boundingRectangle - the rectangle which the innerRectangle must fit inside
 * @param {number} margin - extra margin to be applied [optional, defaults to 0]
 * @return {Position} the new position for innerRectangle in order to constrain it within the boundingRectangle
 */
export function constrainRectangleWithinRectangle(
  innerRectangle: Rectangle,
  boundingRectangle: Rectangle,
  margin = 0,
): Position {
  const maxX = boundingRectangle.size.width + boundingRectangle.position.x - innerRectangle.size.width - margin;
  const maxY = boundingRectangle.size.height + boundingRectangle.position.y - innerRectangle.size.height - margin;

  const minX = boundingRectangle.position.x + margin;
  const minY = boundingRectangle.position.y + margin;

  return {
    x: clamp(
      innerRectangle.position.x,
      minX,
      maxX,
    ),
    y: clamp(
      innerRectangle.position.y,
      minY,
      maxY,
    ),
  };
}
