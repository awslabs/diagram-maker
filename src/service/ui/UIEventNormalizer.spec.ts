import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  DragEventType,
  KeyboardEventType,
  MouseClickEventType,
  MouseMoveEventType,
  WheelEventType,
  WindowEventType
} from 'diagramMaker/service/ui/UIEventManager';
import UITargetNormalizer from 'diagramMaker/service/ui/UITargetNormalizer';

import UIEventNormalizer, { EventAttribute, getRequiredAttribute, MouseButton } from './UIEventNormalizer';

const contextOffset = {
  x: 200,
  y: 400
};

const context = document.body;

describe('UIEventNormalizer', () => {
  describe('getRequiredAttribute', () => {
    it('returns data-event-target for RIGHT_CLICK', () => {
      expect(getRequiredAttribute(MouseClickEventType.RIGHT_CLICK)).toBe(EventAttribute.DATA_EVENT_TARGET);
    });

    it('returns data-event-target for MOUSE_DOWN', () => {
      expect(getRequiredAttribute(MouseClickEventType.MOUSE_DOWN)).toBe(EventAttribute.DATA_EVENT_TARGET);
    });

    it('returns data-event-target for MOUSE_UP', () => {
      expect(getRequiredAttribute(MouseClickEventType.MOUSE_UP)).toBe(EventAttribute.DATA_EVENT_TARGET);
    });

    it('returns data-event-target for MOUSE_DRAG', () => {
      expect(getRequiredAttribute(DragEventType.DRAG)).toBe(EventAttribute.DATA_DRAGGABLE);
    });

    it('returns undefined for anything else', () => {
      expect(getRequiredAttribute(KeyboardEventType.KEY_DOWN)).toBeUndefined();
    });
  });

  describe('normalizeMouseMoveEvent', () => {
    let event: MouseEvent;
    const type = MouseMoveEventType.MOUSE_MOVE;

    beforeEach(() => {
      event = new MouseEvent(type);
    });

    it('normalizes the position', () => {
      const pageX = 250;
      const pageY = 500;

      Object.defineProperty(event, 'pageX', { value: pageX, writable: true });
      Object.defineProperty(event, 'pageY', { value: pageY, writable: true });

      const normalizedEvent: any = UIEventNormalizer.normalizeMouseMoveEvent(event, contextOffset);

      expect(normalizedEvent).not.toBe(undefined);

      expect(normalizedEvent.position).toEqual({
        x: pageX - contextOffset.x,
        y: pageY - contextOffset.y
      });
    });

    it('attaches the original event', () => {
      const normalizedEvent: any = UIEventNormalizer.normalizeMouseMoveEvent(event, contextOffset);

      expect(normalizedEvent.originalEvent).toBe(event);
    });

    it('normalizes the type', () => {
      const normalizedEvent: any = UIEventNormalizer.normalizeMouseMoveEvent(event, contextOffset);

      expect(normalizedEvent.type).toBe(type);
    });
  });

  describe('normalizeRightClickEvent', () => {
    it('calls normalizeMouseClickEvent', () => {
      const type = MouseClickEventType.RIGHT_CLICK;
      const event = new MouseEvent(type);
      const normalizeMouseClickEventSpy = spyOn(UIEventNormalizer, 'normalizeMouseClickEvent');

      UIEventNormalizer.normalizeRightClickEvent(event, contextOffset);

      expect(normalizeMouseClickEventSpy).toHaveBeenCalledTimes(1);
      expect(normalizeMouseClickEventSpy).toHaveBeenCalledWith(event, contextOffset, type);
    });
  });

  describe('normalizeMouseUpEvent', () => {
    it('calls normalizeMouseClickEvent', () => {
      const type = MouseClickEventType.MOUSE_UP;
      const event = new MouseEvent(type);
      const normalizeMouseClickEventSpy = spyOn(UIEventNormalizer, 'normalizeMouseClickEvent');

      UIEventNormalizer.normalizeMouseUpEvent(event, contextOffset);

      expect(normalizeMouseClickEventSpy).toHaveBeenCalledTimes(1);
      expect(normalizeMouseClickEventSpy).toHaveBeenCalledWith(event, contextOffset, type);
    });
  });

  describe('normalizeMouseDownEvent', () => {
    it('calls normalizeMouseClickEvent', () => {
      const type = MouseClickEventType.MOUSE_DOWN;
      const event = new MouseEvent(type);
      const normalizeMouseClickEventSpy = spyOn(UIEventNormalizer, 'normalizeMouseClickEvent');

      UIEventNormalizer.normalizeMouseDownEvent(event, contextOffset);

      expect(normalizeMouseClickEventSpy).toHaveBeenCalledTimes(1);
      expect(normalizeMouseClickEventSpy).toHaveBeenCalledWith(event, contextOffset, type);
    });
  });

  describe('normalizeMouseClickEvent', () => {
    let event: any;
    const type = MouseClickEventType.LEFT_CLICK;

    beforeEach(() => {
      event = new MouseEvent(type);
    });

    it('only triggers if it can find a target with data-event-target', () => {
      const normalizedEvent: any = UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, type);

      expect(normalizedEvent).toBe(undefined);
    });

    it('normalizes the type', () => {
      const target = document.createElement('div');

      target.setAttribute(EventAttribute.DATA_EVENT_TARGET, 'true');
      Object.defineProperty(event, 'target', { value: target, writable: true });

      const normalizedEvent: any = UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, type);

      expect(normalizedEvent.type).toBe(type);
    });

    it('normalizes the position', () => {
      const pageX = 250;
      const pageY = 500;
      const target = document.createElement('div');

      target.setAttribute(EventAttribute.DATA_EVENT_TARGET, 'true');

      Object.defineProperty(event, 'pageX', { value: pageX, writable: true });
      Object.defineProperty(event, 'pageY', { value: pageY, writable: true });
      Object.defineProperty(event, 'target', { value: target, writable: true });

      const normalizedEvent: any = UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, type);
      const targetScreenPosition = target.getBoundingClientRect();

      expect(normalizedEvent.position).toEqual({
        x: pageX - contextOffset.x,
        y: pageY - contextOffset.y
      });
      expect(normalizedEvent.offset).toEqual({
        x: pageX - targetScreenPosition.left - window.pageXOffset,
        y: pageY - targetScreenPosition.top - window.pageYOffset
      });
    });

    it('attaches the original event', () => {
      const target = document.createElement('div');

      target.setAttribute(EventAttribute.DATA_EVENT_TARGET, 'true');
      Object.defineProperty(event, 'target', { value: target, writable: true });

      const normalizedEvent: any = UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, type);

      expect(normalizedEvent.originalEvent).toBe(event);
    });

    it('normalizes the target', () => {
      const originalTarget = document.createElement('div');
      const id = '1234';
      const dataType = 'example-type';
      const normalizeTargetSpy = jest.spyOn(UITargetNormalizer, 'normalizeTarget');

      originalTarget.setAttribute(EventAttribute.DATA_EVENT_TARGET, 'true');
      originalTarget.setAttribute('data-id', id);
      originalTarget.setAttribute('data-type', type);
      Object.defineProperty(event, 'target', { value: originalTarget, writable: true });

      const normalizedEvent: any = UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, type);

      expect(normalizedEvent.target).toEqual({ id, originalTarget, type });
      expect(normalizeTargetSpy).toHaveBeenCalledTimes(1);
      expect(normalizeTargetSpy).toHaveBeenCalledWith(originalTarget);
    });

    it('normalizes the mouse button', () => {

      const buttonsToTest = [
        MouseButton.LEFT,
        MouseButton.MIDDLE,
        MouseButton.RIGHT,
        MouseButton.BROWSER_BACK,
        MouseButton.BROWSER_FORWARD
      ];

      buttonsToTest.forEach((button) => {
        event = new MouseEvent(type, { button });

        const target = document.createElement('div');

        target.setAttribute(EventAttribute.DATA_EVENT_TARGET, 'true');
        Object.defineProperty(event, 'target', { value: target, writable: true });

        const normalizedEvent: any = UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, type);

        expect(normalizedEvent.button).toBe(button);
      });
    });
  });

  describe('normalizeWheelEvent', () => {
    let event: any;
    let normalizedEvent: any;
    const deltaY = 100;
    const type = WheelEventType.MOUSE_WHEEL;

    beforeEach(() => {
      event = new WheelEvent(type, { deltaY });
      normalizedEvent = UIEventNormalizer.normalizeWheelEvent(event, contextOffset);
    });

    it('normalizes the delta', () => {
      expect(normalizedEvent.delta).toBe(deltaY);
    });

    it('normalizes the position', () => {
      const pageX = 250;
      const pageY = 500;

      Object.defineProperty(event, 'pageX', { value: pageX, writable: true });
      Object.defineProperty(event, 'pageY', { value: pageY, writable: true });

      normalizedEvent = UIEventNormalizer.normalizeWheelEvent(event, contextOffset);

      expect(normalizedEvent.position).toEqual({
        x: pageX - contextOffset.x,
        y: pageY - contextOffset.y
      });
    });

    it('attaches the original event', () => {
      expect(normalizedEvent.originalEvent).toBe(event);
    });

    it('normalizes the type', () => {
      expect(normalizedEvent.type).toBe(type);
    });
  });

  describe('normalizeWindowEvent', () => {
    let event: any;
    let normalizedEvent: any;
    const type = WindowEventType.RESIZE;

    beforeEach(() => {
      event = new Event(type);
      normalizedEvent = UIEventNormalizer.normalizeWindowEvent(event, contextOffset);
    });

    it('attaches the original event', () => {
      expect(normalizedEvent.originalEvent).toBe(event);
    });

    it('normalizes the size', () => {
      expect(normalizedEvent.size).toEqual({
        height: 768,
        width: 1024
      });
    });

    it('normalizes the type', () => {
      expect(normalizedEvent.type).toEqual(type);
    });
  });

  describe('normalizeKeyUpEvent', () => {
    it('calls normalizeKeyboardEvent', () => {
      const type = KeyboardEventType.KEY_UP;
      const event = new KeyboardEvent(type);
      const normalizeKeyboardEventSpy = spyOn(UIEventNormalizer, 'normalizeKeyboardEvent');

      UIEventNormalizer.normalizeKeyUpEvent(event, contextOffset);

      expect(normalizeKeyboardEventSpy).toHaveBeenCalledTimes(1);
      expect(normalizeKeyboardEventSpy).toHaveBeenCalledWith(event, contextOffset, type);
    });
  });

  describe('normalizeKeyDownEvent', () => {
    it('calls normalizeKeyboardEvent', () => {
      const type = KeyboardEventType.KEY_DOWN;
      const event = new KeyboardEvent(type);
      const normalizeKeyboardEventSpy = spyOn(UIEventNormalizer, 'normalizeKeyboardEvent');

      UIEventNormalizer.normalizeKeyDownEvent(event, contextOffset);

      expect(normalizeKeyboardEventSpy).toHaveBeenCalledTimes(1);
      expect(normalizeKeyboardEventSpy).toHaveBeenCalledWith(event, contextOffset, type);
    });
  });

  describe('normalizeKeyPressEvent', () => {
    it('calls normalizeKeyboardEvent', () => {
      const type = KeyboardEventType.KEY_PRESS;
      const event = new KeyboardEvent(type);
      const normalizeKeyboardEventSpy = spyOn(UIEventNormalizer, 'normalizeKeyboardEvent');

      UIEventNormalizer.normalizeKeyPressEvent(event, contextOffset);

      expect(normalizeKeyboardEventSpy).toHaveBeenCalledTimes(1);
      expect(normalizeKeyboardEventSpy).toHaveBeenCalledWith(event, contextOffset, type);
    });
  });

  describe('normalizeContainerEvent', () => {
    const clientRect = {
      height: 10,
      left: 10,
      top: 10,
      width: 10
    };

    let normalizedEvent: any;

    beforeEach(() => {
      context.getBoundingClientRect = jest.fn(() => clientRect) as any;
      normalizedEvent = UIEventNormalizer.normalizeContainerEvent(context);
    });

    it('normalizes the container', () => {
      expect(context.getBoundingClientRect).toBeCalledTimes(1);
      expect(normalizedEvent.contextRect).toEqual(clientRect);
    });
  });

  describe('normalizeKeyboardEvent', () => {
    it('normalizes code, key, shiftKey, metaKey, type & attached the original event', () => {
      const key = 'a';
      const code = 'KeyA';
      const modKey = false;
      const ctrlKey = false;
      const shiftKey = false;
      const metaKey = true;
      const preventDefault = jest.fn();
      const type = KeyboardEventType.KEY_UP;
      const target = document.createElement('div');
      target.setAttribute('data-type', DiagramMakerComponentsType.VIEW);

      const event: any = {
        code, ctrlKey, key, metaKey, preventDefault, shiftKey, target
      };

      const originalEvent = event;
      const normalizedEvent = UIEventNormalizer.normalizeKeyboardEvent(event, contextOffset, type);

      expect(normalizedEvent).toEqual({
        code,
        ctrlKey,
        key,
        metaKey,
        modKey,
        originalEvent,
        shiftKey,
        type
      });
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('prevents default if key is backspace', () => {
      const key = 'Backspace';
      const code = 'KeyA';
      const modKey = false;
      const ctrlKey = false;
      const shiftKey = false;
      const metaKey = true;
      const preventDefault = jest.fn();
      const type = KeyboardEventType.KEY_UP;
      const target = document.createElement('div');
      target.setAttribute('data-type', DiagramMakerComponentsType.VIEW);

      const event: any = {
        code, ctrlKey, key, metaKey, preventDefault, shiftKey, target
      };

      const originalEvent = event;
      const normalizedEvent = UIEventNormalizer.normalizeKeyboardEvent(event, contextOffset, type);

      expect(normalizedEvent).toEqual({
        code,
        ctrlKey,
        key,
        metaKey,
        modKey,
        originalEvent,
        shiftKey,
        type
      });
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('prevents default if key is a and modKey is true', () => {
      const key = 'a';
      const code = 'KeyA';
      const modKey = true;
      const ctrlKey = true;
      const shiftKey = false;
      const metaKey = true;
      const preventDefault = jest.fn();
      const type = KeyboardEventType.KEY_UP;
      const target = document.createElement('div');
      target.setAttribute('data-type', DiagramMakerComponentsType.VIEW);

      const event: any = {
        code, ctrlKey, key, metaKey, preventDefault, shiftKey, target
      };

      const originalEvent = event;
      const normalizedEvent = UIEventNormalizer.normalizeKeyboardEvent(event, contextOffset, type);

      expect(normalizedEvent).toEqual({
        code,
        ctrlKey,
        key,
        metaKey,
        modKey,
        originalEvent,
        shiftKey,
        type
      });
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('doesnt normalize if target is not diagram maker view', () => {
      const key = 'Backspace';
      const code = 'KeyA';
      const modKey = false;
      const ctrlKey = false;
      const shiftKey = false;
      const metaKey = true;
      const preventDefault = jest.fn();
      const type = KeyboardEventType.KEY_UP;
      const target = document.createElement('div');

      const event: any = {
        code, ctrlKey, key, metaKey, preventDefault, shiftKey, target
      };

      const originalEvent = event;
      const normalizedEvent = UIEventNormalizer.normalizeKeyboardEvent(event, contextOffset, type);

      expect(normalizedEvent).toBeUndefined();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
