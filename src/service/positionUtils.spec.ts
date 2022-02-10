import {
  add,
  constrainRectangleWithinRectangle,
  fromContainerToPage,
  fromPageToContainer,
  fromPageToScreen,
  fromScreenToPage,
  getCenterCoordinateForCurve,
  getInflectionPoint,
  getMidpoint,
  getScrollPosition,
  isPositionInRectangle,
  subtract,
} from './positionUtils';

describe('positionUtils', () => {
  describe('getCenterCoordinateForCurve', () => {
    it('returns the center coordinate for bezier curve', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 10, y: 10 };
      const control = { x: 5, y: 5 };
      expect(getCenterCoordinateForCurve(src, dest, control)).toEqual({ x: 5, y: 5 });
    });
  });

  describe('getInflectionPoint', () => {
    it('returns position for inflection between two positions', () => {
      const position1 = { x: 10, y: 10 };
      const position2 = { x: 20, y: 20 };
      expect(getInflectionPoint(position1, position2)).toEqual({ x: 20, y: 10 });
    });
  });

  describe('getMidpoint', () => {
    it('returns the midpoint between two positions', () => {
      const position1 = { x: 10, y: 10 };
      const position2 = { x: 20, y: 20 };
      expect(getMidpoint(position1, position2)).toEqual({ x: 15, y: 15 });
    });
  });

  describe('getScrollPosition', () => {
    it('returns scroll position in position format', () => {
      expect(getScrollPosition()).toEqual({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    });
  });

  describe('add', () => {
    it('returns added position object', () => {
      const position1 = { x: 30, y: 30 };
      const position2 = { x: 20, y: 20 };
      expect(add(position1, position2)).toEqual({ x: 50, y: 50 });
    });
  });

  describe('subtract', () => {
    it('returns subtracted position object', () => {
      const position1 = { x: 30, y: 30 };
      const position2 = { x: 20, y: 20 };
      expect(subtract(position1, position2)).toEqual({ x: 10, y: 10 });
    });
  });

  describe('fromScreenToPage', () => {
    it('returns page relative position', () => {
      const screenPosition: any = { left: 30, top: 30 };
      expect(fromScreenToPage(screenPosition)).toEqual({
        x: screenPosition.left + window.pageXOffset,
        y: screenPosition.top + window.pageYOffset,
      });
    });
  });

  describe('fromPageToScreen', () => {
    it('returns screen relative position', () => {
      const pagePosition = { x: 30, y: 30 };
      expect(fromPageToScreen(pagePosition)).toEqual({
        x: pagePosition.x - window.pageXOffset,
        y: pagePosition.y - window.pageYOffset,
      });
    });
  });

  describe('fromPageToContainer', () => {
    it('returns position relative to container', () => {
      const pagePosition = { x: 30, y: 30 };
      const containerOffset = { x: 20, y: 20 };
      expect(fromPageToContainer(pagePosition, containerOffset)).toEqual({ x: 10, y: 10 });
    });
  });

  describe('fromContainerToPage', () => {
    it('returns position relative to page', () => {
      const containerPosition = { x: 30, y: 30 };
      const containerOffset = { x: 20, y: 20 };
      expect(fromContainerToPage(containerPosition, containerOffset)).toEqual({ x: 50, y: 50 });
    });
  });

  describe('isPositionInRectangle', () => {
    const xCoordinatesOutside = [-100, 0, 49, 451, 50000];
    const xCoordinatesInside = [50, 250, 450];
    const yCoordinatesOutside = [-100, 0, 49, 451, 50000];
    const yCoordinatesInside = [50, 250, 450];
    const rectangle = {
      position: {
        x: 50,
        y: 50,
      },
      size: {
        height: 400,
        width: 400,
      },
    };

    it('returns false if the position is outside of the rectangle', () => {
      // x outside and y inside should return false
      xCoordinatesOutside.forEach((x) => {
        yCoordinatesInside.forEach((y) => {
          expect(isPositionInRectangle({ x, y }, rectangle)).toBe(false);
        });
      });

      // x inside and y outside should return false
      xCoordinatesInside.forEach((x) => {
        yCoordinatesOutside.forEach((y) => {
          expect(isPositionInRectangle({ x, y }, rectangle)).toBe(false);
        });
      });

      // x outside and y outside should return false
      yCoordinatesOutside.forEach((y) => {
        xCoordinatesOutside.forEach((x) => {
          expect(isPositionInRectangle({ x, y }, rectangle)).toBe(false);
        });
      });
    });

    it('returns true if the position is inside the rectangle', () => {
      // cases where x and y are both inside should return true
      yCoordinatesInside.forEach((y) => {
        xCoordinatesInside.forEach((x) => {
          expect(isPositionInRectangle({ x, y }, rectangle)).toBe(true);
        });
      });
    });
  });

  describe('constrainRectangleWithinRectangle', () => {
    const boundingRectangle = {
      position: { x: 200, y: 250 },
      size: { width: 100, height: 150 },
    };
    const margin = 25;
    const testCases = [
      // Inside (unchanged)
      {
        expectedPosition: {
          x: 230,
          y: 320,
        },
        position: {
          x: 230,
          y: 320,
        },
        size: { width: 10, height: 10 },
      },

      // Right side is out of bounds
      {
        expectedPosition: {
          x: 265,
          y: 320,
        },
        position: {
          x: 290,
          y: 320,
        },
        size: { width: 10, height: 10 },
      },

      // Left side is out of bounds
      {
        expectedPosition: {
          x: 225,
          y: 320,
        },
        position: {
          x: 215,
          y: 320,
        },
        size: { width: 10, height: 10 },
      },

      // Top is out of bounds
      {
        expectedPosition: {
          x: 230,
          y: 275,
        },
        position: {
          x: 230,
          y: 240,
        },
        size: { width: 10, height: 10 },
      },

      // Bottom is out of bounds
      {
        expectedPosition: {
          x: 230,
          y: 365,
        },
        position: {
          x: 230,
          y: 400,
        },
        size: { width: 10, height: 10 },
      },

      // Totally out of bounds
      {
        expectedPosition: {
          x: 225,
          y: 365,
        },
        position: {
          x: -1000,
          y: 1000,
        },
        size: { width: 10, height: 10 },
      },
    ];

    it('returns the expected position', () => {
      testCases.forEach((testCase) => {
        const { size, position, expectedPosition } = testCase;
        const result = constrainRectangleWithinRectangle({ position, size }, boundingRectangle, margin);

        expect(result).toEqual(expectedPosition);
      });
    });
  });
});
