import Observer from 'diagramMaker/service/observer/Observer';
import { fromContainerToPage, fromScreenToPage, subtract } from 'diagramMaker/service/positionUtils';
import UIEventNormalizer, {
  EventNormalizer,
  getRequiredAttribute,
  MouseButton,
  NormalizedContainerEvent,
  NormalizedMouseClickEvent,
  NormalizedMouseMoveEvent
} from 'diagramMaker/service/ui/UIEventNormalizer';
import UITargetNormalizer from 'diagramMaker/service/ui/UITargetNormalizer';
import { Position } from 'diagramMaker/state/types';

export enum ContainerEventType {
  DIAGRAM_MAKER_CONTAINER_UPDATE = 'diagramMakerContainerUpdate'
}

export enum DestroyEventType {
  DESTROY = 'destroy'
}

export enum MouseClickEventType {
  LEFT_CLICK = 'click',
  RIGHT_CLICK = 'contextmenu',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup'
}

export enum MouseMoveEventType {
  MOUSE_MOVE = 'mousemove',
  MOUSE_OVER = 'mouseover',
  MOUSE_OUT = 'mouseout'
}

export enum WheelEventType {
  MOUSE_WHEEL = 'wheel'
}

export enum WindowEventType {
  RESIZE = 'resize'
}

export enum DragEventType {
  DRAG_END = '__dragend',
  DRAG = '__drag',
  DRAG_START = '__dragstart'
}

export enum DropEventType {
  DROP = '__drop',
  DRAG_ENTER = '__dragenter',
  DRAG_LEAVE = '__dragleave',
  DRAG_OVER = '__dragover'
}

export enum KeyboardEventType {
  KEY_DOWN = 'keydown',
  KEY_UP = 'keyup',
  KEY_PRESS = 'keypress'
}

export type EventType = ContainerEventType | DestroyEventType |
  MouseMoveEventType | MouseClickEventType | WheelEventType |
  WindowEventType | DragEventType | KeyboardEventType | DropEventType;

export const MouseClickEvent = { ...MouseClickEventType };
export const MouseMoveEvent = { ...MouseMoveEventType };
export const WheelEvent = { ...WheelEventType };
export const WindowEvent = { ...WindowEventType };
export const DragEvent = { ...DragEventType };
export const DropEvent = { ...DropEventType };
export const KeyboardEvent = { ...KeyboardEventType };

export const Event = {
  ...MouseClickEvent,
  ...MouseMoveEvent,
  ...WheelEvent,
  ...WindowEvent,
  ...DragEvent,
  ...DropEvent,
  ...KeyboardEvent
};

export type EventListener = (event: Event) => void;

export interface EventListenerRef {
  eventType: EventType;
  eventListener: EventListener;
  context: HTMLElement | Window;
}

const { MOUSE_DOWN, MOUSE_UP, LEFT_CLICK, RIGHT_CLICK } = MouseClickEventType;
const { MOUSE_WHEEL } = WheelEventType;
const { MOUSE_MOVE, MOUSE_OVER, MOUSE_OUT } = MouseMoveEventType;
const { RESIZE } = WindowEventType;
const { DRAG, DRAG_START, DRAG_END } = DragEventType;
const { DROP, DRAG_OVER, DRAG_ENTER, DRAG_LEAVE } = DropEventType;
const { KEY_DOWN, KEY_UP, KEY_PRESS } = KeyboardEventType;
const { DIAGRAM_MAKER_CONTAINER_UPDATE } = ContainerEventType;
const { DESTROY } = DestroyEventType;

const { normalizeTarget, getTarget } = UITargetNormalizer;

export default class UIEventManager {
  private potentialClickable?: HTMLElement;
  private potentialDraggable?: HTMLElement;
  private currentDraggable?: HTMLElement;
  private currentDropTarget?: HTMLElement;
  private currentDragOffset?: Position;
  private dragReference?: Position;
  private contextOffset: Position;
  private eventListenerRefs: EventListenerRef[] = [];

  constructor(private observer: Observer, private context: HTMLElement) {
    // Mouse
    this.listenFor(MOUSE_DOWN, UIEventNormalizer.normalizeMouseDownEvent, window);
    this.listenFor(MOUSE_UP, UIEventNormalizer.normalizeMouseUpEvent, window);
    this.listenFor(MOUSE_MOVE, UIEventNormalizer.normalizeMouseMoveEvent, window);
    this.listenFor(RIGHT_CLICK, UIEventNormalizer.normalizeRightClickEvent, window);
    this.listenFor(MOUSE_OVER, UIEventNormalizer.normalizeMouseOverEvent, window);
    this.listenFor(MOUSE_OUT, UIEventNormalizer.normalizeMouseOutEvent, window);

    // Wheel
    this.listenFor(MOUSE_WHEEL, UIEventNormalizer.normalizeWheelEvent);

    // Window
    this.listenFor(RESIZE, UIEventNormalizer.normalizeWindowEvent, window);

    // Keyboard
    this.listenFor(KEY_DOWN, UIEventNormalizer.normalizeKeyDownEvent);
    this.listenFor(KEY_UP, UIEventNormalizer.normalizeKeyUpEvent);
    this.listenFor(KEY_PRESS, UIEventNormalizer.normalizeKeyPressEvent);

    // Synthetic drag and drop events
    this.listenForSyntheticEvents();

    const contextRect = context.getBoundingClientRect();
    this.contextOffset = fromScreenToPage(contextRect);
  }

  private listenForSyntheticEvents(): void {

    const { subscribe } = this.observer;

    // Listen to MOUSE_DOWN for potential DRAG
    subscribe(MOUSE_DOWN, this.handleMouseDown);

    // Listen to MOUSE_UP for potential DRAG_END or CLICK
    subscribe(MOUSE_UP, this.handleMouseUp);

    // Listen to MOUSE_MOVE for potential DRAG
    subscribe(MOUSE_MOVE, this.handleMouseMove);

    // Listen to CONSUMER_CONTAINER_RESIZE to update cached container offsets
    subscribe(DIAGRAM_MAKER_CONTAINER_UPDATE, this.updateContext);

    // Listen to DESTROY to cleanup application/application context
    subscribe(DESTROY, this.destroyCreatedEventListeners);
  }

  private listenFor(
    eventType: EventType,
    normalizer: EventNormalizer,
    context: HTMLElement | Window = this.context
  ): void {
    const eventListener = this.createEventListener(eventType, normalizer);
    this.saveEventListenerRef(eventType, eventListener, context);
    context.addEventListener(eventType, eventListener);
  }

  private createEventListener = (eventType: EventType, normalizer: EventNormalizer): EventListener => {
    return (event: Event): void => {
      const normalizedEvent = normalizer(event, this.contextOffset);

      if (normalizedEvent) {
        this.observer.publish(eventType, normalizedEvent);
      }
    };
  }

  private saveEventListenerRef = (
    eventType: EventType,
    eventListener: EventListener,
    context: HTMLElement | Window
  ): void => {
    this.eventListenerRefs.push({ eventType, eventListener, context });
  }

  private destroyCreatedEventListeners = (): void => {
    this.eventListenerRefs.forEach(this.destroyEventListener);
    this.eventListenerRefs = [];
  }

  private destroyEventListener = ({ eventType, eventListener, context }: EventListenerRef): void => {
    context.removeEventListener(eventType, eventListener);
  }

  private updateContext = (event: NormalizedContainerEvent) => {
    this.setContextOffset(fromScreenToPage(event.contextRect));
  }

  private handleLeftMouseUp = (event: NormalizedMouseClickEvent): void => {
    this.setPotentialDraggable(undefined);
    // https://stackoverflow.com/questions/38111946/is-there-a-defined-ordering-between-dragend-and-drop-events
    this.checkForDrop(event);
    this.checkForDragEnd(event);
    this.checkForLeftClick(event);
    this.setPotentialClickable(undefined);
    this.setCurrentDraggable(undefined);
  }

  private handleMouseUp = (event: NormalizedMouseClickEvent): void => {
    const { button } = event;
    switch (button) {
      case MouseButton.LEFT:
        return this.handleLeftMouseUp(event);
    }
  }

  private handleLeftMouseDown = (event: NormalizedMouseClickEvent): void => {
    this.checkForPotentialDraggable(event);
    this.setPotentialClickable(event.target.originalTarget);
  }

  private checkForPotentialDraggable = (event: NormalizedMouseClickEvent) => {
    const requiredAttribute = getRequiredAttribute(DragEventType.DRAG);
    const target = getTarget(event.originalEvent, requiredAttribute);

    if (!target) {
      return;
    }

    // Get the offset from the draggable target, which is not necessesarily the item that was clicked
    const targetScreenPosition = target.getBoundingClientRect();
    const targetPagePosition = fromScreenToPage(targetScreenPosition);

    const pagePosition = fromContainerToPage(event.position, this.contextOffset);

    const offset: Position = subtract(pagePosition, targetPagePosition);

    this.setPotentialDraggable(target);
    this.setCurrentDragOffset(offset);
    this.setDragReference(targetPagePosition);
  }

  // These private setters exist solely for the purpose of
  // being able spy on the property changes in tests

  private setPotentialDraggable = (potentialDraggable?: HTMLElement) => {
    this.potentialDraggable = potentialDraggable;
  }

  private setPotentialClickable = (clickable?: HTMLElement) => {
    this.potentialClickable = clickable;
  }

  private setCurrentDragOffset = (dragOffset?: Position) => {
    this.currentDragOffset = dragOffset;
  }

  private setDragReference = (refPosition?: Position) => {
    this.dragReference = refPosition;
  }

  private setCurrentDropTarget = (dropTarget?: HTMLElement) => {
    this.currentDropTarget = dropTarget;
  }

  private setCurrentDraggable = (draggable?: HTMLElement) => {
    this.currentDraggable = draggable;
  }

  private setContextOffset = (offset: Position) => {
    this.contextOffset = offset;
  }

  private handleMouseDown = (event: NormalizedMouseClickEvent): void => {
    const { button } = event;
    switch (button) {
      case MouseButton.LEFT:
        return this.handleLeftMouseDown(event);
    }
  }

  private handleMouseMove = (event: NormalizedMouseMoveEvent): void => {
    this.checkForDragStart(event);
    this.checkForDrag(event);
    this.checkForDragEnter(event);
    this.checkForDragLeave(event);
    this.checkForDragOver(event);
  }

  private checkForDrag = (event: NormalizedMouseMoveEvent): void => {
    if (!this.currentDraggable) {
      return;
    }

    const { position } = event;
    const offset = this.currentDragOffset;
    const dragReference = this.dragReference;
    const target = normalizeTarget(this.currentDraggable);
    const type = DragEventType.DRAG;

    this.observer.publish(DRAG, { offset, position, target, type, dragReference });
  }

  private checkForDragLeave = (event: NormalizedMouseMoveEvent): void => {
    if (!this.currentDraggable) {
      return;
    }

    if (!this.currentDropTarget) {
      return;
    }

    if (UITargetNormalizer.getDropZoneTarget(event.position, this.contextOffset)) {
      return;
    }

    const offset = this.currentDragOffset;
    const { position } = event;
    const dropzone = normalizeTarget(this.currentDropTarget);
    const target = normalizeTarget(this.currentDraggable);
    const type = DropEventType.DRAG_LEAVE;

    this.setCurrentDropTarget(undefined);

    this.observer.publish(DRAG_LEAVE, { dropzone, offset, position, target, type });
  }

  private checkForDragOver = (event: NormalizedMouseMoveEvent): void => {
    if (!this.currentDraggable) {
      return;
    }

    const { position } = event;
    const dropzoneElement = UITargetNormalizer.getDropZoneTarget(position, this.contextOffset);

    if (!dropzoneElement) {
      return;
    }

    const offset = this.currentDragOffset;
    const target = this.currentDraggable;
    const dropzone = normalizeTarget(dropzoneElement);
    const type = DropEventType.DRAG_OVER;

    return this.observer.publish(DRAG_OVER, { dropzone, offset, position, target, type });
  }

  private checkForDrop = (event: NormalizedMouseClickEvent): void => {
    if (!this.currentDraggable) {
      return;
    }

    const dropzoneElement = this.currentDropTarget;

    if (!dropzoneElement) {
      return;
    }

    const { position } = event;
    const target = normalizeTarget(this.currentDraggable);
    const dropzone = normalizeTarget(dropzoneElement);
    const type = DropEventType.DROP;

    this.observer.publish(DROP, { dropzone, position, target, type });
  }

  // Because we are creating a synthetic drag event which the browser isn't controlling,
  // it will automatically fire the click event when a drag ends. We want to be able to
  // make sure we weren't dragging before firing click.

  private checkForLeftClick = (event: NormalizedMouseClickEvent): void => {
    if (!this.potentialClickable) {
      return;
    }

    if (this.currentDraggable) {
      return;
    }

    if (this.potentialClickable !== event.target.originalTarget) {
      return;
    }

    this.observer.publish(LEFT_CLICK, {
      ...event,
      type: MouseClickEventType.LEFT_CLICK
    });
  }

  private checkForDragEnd = (event: NormalizedMouseClickEvent): void => {
    if (!this.currentDraggable) {
      return;
    }

    const target = this.currentDraggable;
    const { position } = event;

    this.observer.publish(DRAG_END, {
      position,
      target: normalizeTarget(target),
      type: DragEventType.DRAG_END
    });
  }

  private checkForDragStart = (event: NormalizedMouseMoveEvent): void => {
    if (this.currentDraggable) {
      return;
    }

    const unNormalizedTarget = this.potentialDraggable;

    if (!unNormalizedTarget) {
      return;
    }

    const { position } = event;
    const target = normalizeTarget(unNormalizedTarget);
    const type = DragEventType.DRAG_START;

    this.setCurrentDraggable(unNormalizedTarget);

    this.observer.publish(DRAG_START, {
      position,
      target,
      type
    });
  }

  private checkForDragEnter = (event: NormalizedMouseMoveEvent): void => {
    if (!this.currentDraggable) {
      return;
    }

    const { position } = event;
    const dropzoneElement = UITargetNormalizer.getDropZoneTarget(position, this.contextOffset);

    if (!dropzoneElement) {
      return;
    }

    if (this.currentDropTarget === dropzoneElement) {
      return;
    }

    this.setCurrentDropTarget(dropzoneElement);

    const dropzone = normalizeTarget(dropzoneElement);
    const target = normalizeTarget(this.currentDraggable);
    const type = DropEventType.DRAG_ENTER;

    this.observer.publish(DRAG_ENTER, { dropzone, position, target, type });
  }
}
