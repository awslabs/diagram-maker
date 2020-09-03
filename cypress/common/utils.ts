/**
 * Cypress translates CSS transforms as matrix functions.
 * Read more about them here: https://dev.opera.com/articles/understanding-the-css-transforms-matrix/
 * Takes translate2d x & y values to return matrix style expected from Cypress
 * @param {number} x
 * @param {number} y
 * @return {string} Matrix CSS value
 */
export function convertTranslate2dToMatrix(x: number, y: number): string {
  return `matrix(1, 0, 0, 1, ${x}, ${y})`;
}

/**
 * Cypress translates CSS transforms as matrix functions.
 * Read more about them here: https://dev.opera.com/articles/understanding-the-css-transforms-matrix/
 * Takes scale value to return matrix style expected from Cypress
 * @param {number} x
 * @param {number} y
 * @return {string} Matrix CSS value
 */
export function convertScaleToMatrix(scale: number, x = 0, y = 0): string {
  return `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`;
}
