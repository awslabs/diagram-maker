import * as browserUtils from './browserUtils';

const { getBrowserRectangle, getBrowserSize } = browserUtils;
const originalDocument = document;
const unmockDocument = () => {
  Object.defineProperty(document, 'prototype', {
    value: originalDocument,
    writable: true,
  });
};

describe('browserUtils', () => {
  beforeEach(() => {
    unmockDocument();
  });

  describe('getBrowserSize', () => {
    let body;

    beforeEach(() => {
      body = {
        offsetHeight: 3,
        offsetWidth: 2,
        scrollHeight: 4,
        scrollWidth: 1,
      };

      Object.defineProperty(document, 'body', { value: body, writable: true });
    });

    it('returns the highest width and height values when documentElement does not exist', () => {
      Object.defineProperty(document, 'documentElement', { value: undefined, writable: true });

      expect(getBrowserSize()).toEqual({
        height: 4,
        width: 2,
      });
    });

    it('returns the highest width and height values when documentElement does exist', () => {
      const documentElement = {
        clientHeight: 8,
        clientWidth: 7,
        offsetHeight: 9,
        offsetWidth: 6,
        scrollHeight: 10,
        scrollWidth: 5,
      };

      Object.defineProperty(document, 'documentElement', { value: documentElement, writable: true });

      expect(getBrowserSize()).toEqual({
        height: 10,
        width: 7,
      });
    });
  });

  describe('getBrowserRectangle', () => {
    it('returns x: 0, y: 0 as the position property', () => {
      expect(getBrowserRectangle().position).toEqual({
        x: 0,
        y: 0,
      });
    });

    it('returns the value returned from getBrowserSize() as the size property', () => {
      const expectedValue = getBrowserSize();

      expect(getBrowserRectangle().size).toEqual(expectedValue);
    });
  });
});
