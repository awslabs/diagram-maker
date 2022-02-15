import * as browserUtils from 'diagramMaker/service/browserUtils';
import * as positionUtils from 'diagramMaker/service/positionUtils';

import { EventAttribute } from './UIEventNormalizer';
import UITargetNormalizer, { NormalizedTarget } from './UITargetNormalizer';

const { fromContainerToPage, fromPageToScreen } = positionUtils;

const originalGetDropZoneTargetMethod = UITargetNormalizer.getDropZoneTarget;
const originalGetElementsFromPointMethod = UITargetNormalizer.getElementsFromPoint;
const originalElementsFromPointMethod = document.elementsFromPoint;
// IE 11 specific method not part of typescript definitions for DOM API
const originalMsElementsFromPointMethod = (document as any).msElementsFromPoint;

export const unmockGetDropZoneTarget = () => {
  Object.defineProperty(UITargetNormalizer, 'getDropZoneTarget', {
    value: originalGetDropZoneTargetMethod,
    writable: true,
  });
};

export const mockGetDropZoneTarget = (value: any) => {
  Object.defineProperty(UITargetNormalizer, 'getDropZoneTarget', {
    value,
    writable: true,
  });
};

export const unmockGetElementsFromPoint = () => {
  Object.defineProperty(UITargetNormalizer, 'getElementsFromPoint', {
    value: originalGetElementsFromPointMethod,
    writable: true,
  });
};

// TODO these should be typed as functions
export const mockGetElementsFromPoint = (value: any) => {
  Object.defineProperty(UITargetNormalizer, 'getElementsFromPoint', {
    value,
    writable: true,
  });
};

export const unmockElementsFromPoint = () => {
  Object.defineProperty(document, 'elementsFromPoint', {
    value: originalElementsFromPointMethod,
    writable: true,
  });
};

export const mockElementsFromPoint = (value: any) => {
  Object.defineProperty(document, 'elementsFromPoint', {
    value,
    writable: true,
  });
};

export const unmockMsElementsFromPoint = () => {
  Object.defineProperty(document, 'elementsFromPoint', {
    value: originalMsElementsFromPointMethod,
    writable: true,
  });
};

export const mockMsElementsFromPoint = (value: any) => {
  Object.defineProperty(document, 'msElementsFromPoint', {
    value,
    writable: true,
  });
};

afterEach(() => {
  unmockGetElementsFromPoint();
  unmockGetDropZoneTarget();
});

describe('UITargetNormalizer', () => {
  describe('normalizeTarget', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
    });

    it('normalizes the id from the data-id attribute', () => {
      const id = 'example-id';
      element.setAttribute('data-id', id);
      const normalizedTarget: NormalizedTarget = UITargetNormalizer.normalizeTarget(element);

      expect(normalizedTarget.id).toBe(id);
    });

    it('normalizes the type from the data-type attribute', () => {
      const type = 'example-type';
      element.setAttribute('data-type', type);
      const normalizedTarget: NormalizedTarget = UITargetNormalizer.normalizeTarget(element);

      expect(normalizedTarget.type).toBe(type);
    });

    it('attaches the element as originalElement', () => {
      const normalizedTarget: NormalizedTarget = UITargetNormalizer.normalizeTarget(element);

      expect(normalizedTarget.originalTarget).toBe(element);
    });

    it('defaults id and type to undefined if they are not specified in the dom', () => {
      const normalizedTarget: NormalizedTarget = UITargetNormalizer.normalizeTarget(element);

      expect(normalizedTarget.id).toBe(undefined);
      expect(normalizedTarget.type).toBe(undefined);
    });
  });

  describe('getTarget', () => {
    let parentElement: HTMLElement;
    let childElement: HTMLElement;
    let event: MouseEvent;

    beforeEach(() => {
      parentElement = document.createElement('div');
      childElement = document.createElement('div');
      event = new MouseEvent('click');
    });

    it('returns undefined if the event has no target', () => {
      const target = UITargetNormalizer.getTarget(new MouseEvent('click'));

      expect(target).toBe(undefined);
    });

    it('returns undefined if none of the targets are valid', () => {
      parentElement.appendChild(childElement);
      Object.defineProperty(event, 'target', { value: childElement, writable: true });
      const target = UITargetNormalizer.getTarget(event, EventAttribute.DATA_EVENT_TARGET);

      expect(target).toBe(undefined);
    });

    it('returns the event.target if no requiredAttribute is specified', () => {
      Object.defineProperty(event, 'target', { value: parentElement, writable: true });

      const target = UITargetNormalizer.getTarget(event);
      expect(target).toBe(parentElement);
    });

    it('returns the first matching target it finds', () => {
      parentElement.appendChild(childElement);

      Object.defineProperty(event, 'target', { value: childElement, writable: true });

      const target = UITargetNormalizer.getTarget(event);
      expect(target).toBe(childElement);
    });

    it('loops through target parents to find a matching target', () => {
      parentElement.setAttribute(EventAttribute.DATA_EVENT_TARGET, 'true');
      parentElement.appendChild(childElement);

      Object.defineProperty(event, 'target', { value: childElement, writable: true });

      const target = UITargetNormalizer.getTarget(event, EventAttribute.DATA_EVENT_TARGET);
      expect(target).toBe(parentElement);
    });

    it('loops through target parents to find a matching target with a specific attribute value', () => {
      const type = 'testType';
      parentElement.setAttribute('data-type', type);
      parentElement.appendChild(childElement);

      Object.defineProperty(event, 'target', { value: childElement, writable: true });

      const target = UITargetNormalizer.getTarget(event, 'data-type', type);
      expect(target).toBe(parentElement);
    });
  });

  describe('getDropZoneTarget', () => {
    it('returns the first matching target it finds', () => {
      const elementWithDropzone = document.createElement('div');

      elementWithDropzone.setAttribute('data-dropzone', 'true');

      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        elementWithDropzone,
        document.createElement('div'),
        document.createElement('div'),
      ];

      const contextOffset = { x: 0, y: 0 };
      const position = { x: 1, y: 1 };

      const mockedGetElementsFromPoint = jest.fn(() => elements);

      mockGetElementsFromPoint(mockedGetElementsFromPoint);

      const expectedPoint = fromPageToScreen(fromContainerToPage(position, contextOffset));

      const result = UITargetNormalizer.getDropZoneTarget(position, contextOffset);
      expect(result).toBe(elementWithDropzone);
      expect(mockedGetElementsFromPoint).toHaveBeenCalledWith(expectedPoint);
    });

    it('returns undefined if there are not any matching targets', () => {
      const elements = [document.createElement('div')];

      const mockedGetElementsFromPoint = jest.fn(() => elements);

      mockGetElementsFromPoint(mockedGetElementsFromPoint);

      const contextOffset = { x: 0, y: 0 };
      const position = { x: 1, y: 1 };

      const expectedPoint = fromPageToScreen(fromContainerToPage(position, contextOffset));

      const result = UITargetNormalizer.getDropZoneTarget(position, contextOffset);
      expect(result).toBe(undefined);
      expect(mockedGetElementsFromPoint).toHaveBeenCalledWith(expectedPoint);
    });
  });

  describe('checkAttributeValue', () => {
    it('returns false if the attribute does not exist', () => {
      const element = document.createElement('div');
      const result = UITargetNormalizer.checkAttributeValue(element, 'example-attribute');

      expect(result).toBeFalsy();
    });

    it('returns false if the attribute is false', () => {
      const element = document.createElement('div');
      element.setAttribute('example-attribute', 'false');
      const result = UITargetNormalizer.checkAttributeValue(element, 'example-attribute');

      expect(result).toBeFalsy();
    });

    it('returns true if the attribute exists and is true', () => {
      const element = document.createElement('div');
      element.setAttribute('example-attribute', 'true');
      const result = UITargetNormalizer.checkAttributeValue(element, 'example-attribute');

      expect(result).toBeTruthy();
    });

    it('returns true if the attribute exists and matches supplied value', () => {
      const element = document.createElement('div');
      element.setAttribute('example-attribute', 'testValue');
      const result = UITargetNormalizer.checkAttributeValue(element, 'example-attribute', 'testValue');

      expect(result).toBeTruthy();
    });
  });

  describe('getElementsFromPoint', () => {
    afterEach(() => {
      unmockElementsFromPoint();
      unmockMsElementsFromPoint();
    });

    it('uses document.elementsFromPoint if possible', () => {
      const elementsFromPointMock = jest.fn();
      const position = { x: 100, y: 100 };

      mockElementsFromPoint(elementsFromPointMock);

      UITargetNormalizer.getElementsFromPoint(position);
      expect(elementsFromPointMock).toHaveBeenCalledTimes(1);
      expect(elementsFromPointMock).toHaveBeenCalledWith(position.x, position.y);
    });

    it('falls back to document.msElementsFromPoint', () => {
      const msElementsFromPointMock = jest.fn(() => []);
      const position = { x: 100, y: 100 };

      mockElementsFromPoint(undefined);
      mockMsElementsFromPoint(msElementsFromPointMock);

      UITargetNormalizer.getElementsFromPoint(position);
      expect(msElementsFromPointMock).toHaveBeenCalledTimes(1);
      expect(msElementsFromPointMock).toHaveBeenCalledWith(position.x, position.y);
    });
  });

  describe('isMouseEventInsideBrowser', () => {
    it('calls isPositionInRectangle with the correct params', () => {
      const x = 150;
      const y = 150;
      const expectedPosition = { x, y };
      const event: any = {
        clientX: x,
        clientY: y,
      };

      const isPositionInRectangleSpy = jest.spyOn(positionUtils, 'isPositionInRectangle');

      UITargetNormalizer.isMouseEventInsideBrowser(event);

      expect(isPositionInRectangleSpy).toHaveBeenCalledTimes(1);
      expect(isPositionInRectangleSpy).toHaveBeenCalledWith(expectedPosition, browserUtils.getBrowserRectangle());
    });
  });

  describe('normalizeMouseEventTarget', () => {
    const positionInsideBrowser = { clientX: 0, clientY: 0 };
    const positionOutsideOfBrowser = { clientX: 100, clientY: 100 };
    const documentTarget = document;
    const nonDocumentTarget = document.body;

    it('returns the event unmodified if the target is falsey', () => {
      const event: any = { ...positionInsideBrowser };
      const result = UITargetNormalizer.normalizeMouseEventTarget(event);

      expect(result).toBe(event);
    });

    it('returns the event unmodified if the result of isMouseEventInsideBrowser is true', () => {
      const event: any = { ...positionInsideBrowser, target: documentTarget };
      const result = UITargetNormalizer.normalizeMouseEventTarget(event);

      expect(result).toBe(event);
    });

    it('returns the event unmodified if the target is not the document', () => {
      const event: any = { ...positionInsideBrowser, target: nonDocumentTarget };
      const result = UITargetNormalizer.normalizeMouseEventTarget(event);

      expect(result).toBe(event);
    });

    it('modifies the event to set the target to document.documentElement', () => {
      const event: any = { ...positionOutsideOfBrowser, target: documentTarget };
      const result = UITargetNormalizer.normalizeMouseEventTarget(event);

      expect(result).not.toBe(event);
      expect(result.target).toBe(document.documentElement);
    });
  });
});
