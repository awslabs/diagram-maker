import { fromPageToContainer, fromScreenToPage, subtract } from 'diagramMaker/service/positionUtils';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import UITargetNormalizer, { NormalizedTarget } from 'diagramMaker/service/ui/UITargetNormalizer';
import { Position, Size } from 'diagramMaker/state/types';

import {
  ContainerEventType,
  DragEventType,
  DropEventType,
  EventType,
  KeyboardEventType,
  MouseClickEventType,
  MouseMoveEventType,
  WheelEventType,
  WindowEventType
} from './UIEventManager';

// to determine platform for ctrl(win)/cmd(mac) modifier key handling
// https://github.com/ianstormtaylor/is-hotkey/blob/master/src/index.js
const IS_MAC = (
  typeof window !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)
);

export enum MouseButton {
  LEFT,
  MIDDLE,
  RIGHT,
  BROWSER_BACK,
  BROWSER_FORWARD
}

export enum KeyboardCode {
  DELETE = 'Delete',
  BACKSPACE = 'Backspace'
}

export enum KeyboardKey {
  A = 'a'
}

export enum EventAttribute {
  DATA_EVENT_TARGET = 'data-event-target',
  DATA_DRAGGABLE = 'data-draggable'
}

export interface NormalizedMouseMoveEvent {
  originalEvent: MouseEvent;
  position: Position;
  type: MouseMoveEventType;
}

export interface NormalizedMouseScrollEvent {
  delta: number;
  originalEvent: WheelEvent;
  position: Position;
  type: WheelEventType;
}

export interface NormalizedMouseClickEvent {
  originalEvent: MouseEvent;
  button: MouseButton;
  position: Position;
  target: NormalizedTarget;
  offset: Position;
  type: MouseClickEventType;
}

export interface NormalizedDragEvent {
  position: Position;
  target: NormalizedTarget;
  offset?: Position;
  dragReference?: Position;
  type: DragEventType;
}

export interface NormalizedDropEvent {
  position: Position;
  target: NormalizedTarget;
  dropzone: NormalizedTarget;
  offset?: Position;
  type: DropEventType;
}

export interface NormalizedContainerEvent {
  contextRect: ClientRect | DOMRect;
  type: ContainerEventType;
}

export interface NormalizedWindowEvent {
  originalEvent: Event;
  size: Size;
  type: WindowEventType;
}

export interface NormalizedKeyboardEvent {
  code: string;
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  modKey: boolean;
  originalEvent: KeyboardEvent;
  type: KeyboardEventType;
}

export type NormalizedEvent =
  NormalizedContainerEvent | NormalizedMouseMoveEvent | NormalizedDragEvent | NormalizedWindowEvent |
  NormalizedMouseScrollEvent | NormalizedMouseClickEvent | NormalizedKeyboardEvent;

export function getRequiredAttribute(type: EventType): EventAttribute | undefined {
  switch (type) {
    case MouseClickEventType.RIGHT_CLICK: return EventAttribute.DATA_EVENT_TARGET;
    case MouseClickEventType.MOUSE_DOWN: return EventAttribute.DATA_EVENT_TARGET;
    case MouseClickEventType.MOUSE_UP: return EventAttribute.DATA_EVENT_TARGET;
    case DragEventType.DRAG: return EventAttribute.DATA_DRAGGABLE;
  }
}

// @FIXME Even though MouseEvent and WheelEvent both extend Event,
// typescript won't allow this to be typed as Event
// nor MouseEvent | WheelEvent | Event
// nor a union type of MouseEvent | WheelEvent | Event
export type EventNormalizer = (event: any, contextOffset: Position) => NormalizedEvent | void | undefined;
export default class UIEventNormalizer {
  public static normalizeMouseMoveEvent(event: MouseEvent, contextOffset: Position): NormalizedMouseMoveEvent {
    const { pageX, pageY } = event;
    const pagePosition = { x: pageX, y: pageY };

    return {
      originalEvent: event,
      position: fromPageToContainer(pagePosition, contextOffset),
      type: MouseMoveEventType.MOUSE_MOVE
    };
  }

  public static normalizeMouseClickEvent(
    event: MouseEvent,
    contextOffset: Position,
    type: MouseClickEventType
  ): NormalizedMouseClickEvent | undefined {

    const requiredAttribute = getRequiredAttribute(type);
    const targetElement = UITargetNormalizer.getTarget(event, requiredAttribute);

    if (!targetElement) {
      return;
    }

    const { pageX, pageY, button } = event;
    const pagePosition = { x: pageX, y: pageY };
    const position = fromPageToContainer(pagePosition, contextOffset);
    const targetScreenPosition = targetElement.getBoundingClientRect();
    const targetPagePosition = fromScreenToPage(targetScreenPosition);

    // We are calculating the offset here instead of using the
    // event's offset/layer prop because we need to calculate
    // offset relative to the filtered target, not the actual target.

    const offset: Position = subtract(pagePosition, targetPagePosition);

    const originalEvent = event;
    const target = UITargetNormalizer.normalizeTarget(targetElement);

    return {
      button,
      offset,
      originalEvent,
      position,
      target,
      type
    };
  }

  public static normalizeRightClickEvent(
    event: MouseEvent,
    contextOffset: Position
    ): NormalizedMouseClickEvent | undefined {

    return UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, MouseClickEventType.RIGHT_CLICK);
  }

  public static normalizeMouseUpEvent(
    event: MouseEvent,
    contextOffset: Position
    ): NormalizedMouseClickEvent | undefined {

    return UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, MouseClickEventType.MOUSE_UP);
  }

  public static normalizeMouseDownEvent(
    event: MouseEvent,
    contextOffset: Position
    ): NormalizedMouseClickEvent | undefined {

    return UIEventNormalizer.normalizeMouseClickEvent(event, contextOffset, MouseClickEventType.MOUSE_DOWN);
  }

  public static normalizeWheelEvent(event: WheelEvent, contextOffset: Position): NormalizedMouseScrollEvent {
    const { deltaY, pageX, pageY } = event;
    const pagePosition = { x: pageX, y: pageY };

    return {
      delta: deltaY,
      originalEvent: event,
      position: fromPageToContainer(pagePosition, contextOffset),
      type: WheelEventType.MOUSE_WHEEL
    };
  }

  public static normalizeContainerEvent(container: HTMLElement): NormalizedContainerEvent {
    const contextRect = container.getBoundingClientRect();

    return {
      contextRect,
      type: ContainerEventType.DIAGRAM_MAKER_CONTAINER_UPDATE
    };
  }

  public static normalizeWindowEvent(event: Event, contextOffset: Position): NormalizedWindowEvent {
    const { innerWidth, innerHeight } = window;

    return {
      originalEvent: event,
      size: { width: innerWidth, height: innerHeight },
      type: WindowEventType.RESIZE
    };
  }

  public static normalizeKeyboardEvent(
    event: KeyboardEvent,
    contextOffset: Position,
    type: KeyboardEventType
  ): NormalizedKeyboardEvent | void {
    const { key, code, shiftKey, metaKey, ctrlKey, target } = event;
    const originalEvent = event;
    const modKey = IS_MAC ? metaKey : ctrlKey;

    if (UITargetNormalizer.checkAttributeValue(target as Element, 'data-type', DiagramMakerComponentsType.VIEW)) {
      if (key === KeyboardCode.BACKSPACE || (key === 'a' && modKey)) {
        // Prevent the browser from navigating back
        // Since the back is fired on diagram maker
        event.preventDefault();
      }

      return {
        code,
        key,
        ctrlKey,
        shiftKey,
        metaKey,
        modKey,
        originalEvent,
        type
      } as NormalizedKeyboardEvent;
    }
  }

  public static normalizeKeyUpEvent(event: KeyboardEvent, contextOffset: Position): NormalizedKeyboardEvent | void {
    return UIEventNormalizer.normalizeKeyboardEvent(event, contextOffset, KeyboardEventType.KEY_UP);
  }

  public static normalizeKeyDownEvent(event: KeyboardEvent, contextOffset: Position): NormalizedKeyboardEvent | void {
    return UIEventNormalizer.normalizeKeyboardEvent(event, contextOffset, KeyboardEventType.KEY_DOWN);
  }

  public static normalizeKeyPressEvent(event: KeyboardEvent, contextOffset: Position): NormalizedKeyboardEvent | void {
    return UIEventNormalizer.normalizeKeyboardEvent(event, contextOffset, KeyboardEventType.KEY_PRESS);
  }
}
