import Observer from 'diagramMaker/service/observer/Observer';
import { fromContainerToPage, fromScreenToPage, subtract } from 'diagramMaker/service/positionUtils';
import UIEventNormalizer, {
  EventAttribute,
  MouseButton,
  NormalizedDragEvent,
  NormalizedDropEvent
} from 'diagramMaker/service/ui/UIEventNormalizer';
import {
  mockGetDropZoneTarget,
  mockGetElementsFromPoint,
  unmockGetDropZoneTarget,
  unmockGetElementsFromPoint
} from 'diagramMaker/service/ui/UITargetNormalizer.spec';

import UIEventManager, {
  ContainerEventType,
  DestroyEventType,
  DragEventType,
  DropEventType,
  MouseClickEventType,
  MouseMoveEventType
} from './UIEventManager';

// The reason some objects are being cast as 'any' within jest.spyOn calls, is because
// we are spying on private methods and jest can't confirm method is keyof class.
// @TODO Investigate if there is a better way to go about testing these private methods

const { LEFT } = MouseButton;
const { DRAG, DRAG_START, DRAG_END } = DragEventType;
const { DROP, DRAG_OVER, DRAG_ENTER, DRAG_LEAVE } = DropEventType;
const { MOUSE_MOVE } = MouseMoveEventType;
const { LEFT_CLICK, MOUSE_DOWN, MOUSE_UP } = MouseClickEventType;

const context = document.body;
context.setAttribute(EventAttribute.DATA_EVENT_TARGET, 'true');
const contextOffset = fromScreenToPage(context.getBoundingClientRect());
let observer: Observer;
let manager: UIEventManager;

beforeEach(() => {
  observer = new Observer();
  manager = new UIEventManager(observer, context);
  context.getBoundingClientRect = jest.fn(() => ({ top: 0, left: 0 })) as any;
});

beforeAll(() => {
  mockGetElementsFromPoint(() => [document.createElement('div')]);
});

afterEach(() => {
  unmockGetElementsFromPoint();
  unmockGetDropZoneTarget();
});

describe('UIEventManager', () => {
  describe('listenFor', () => {
    it('publishes normalized events', () => {
      const mouseMoveMock = jest.fn();

      observer.subscribe(MOUSE_MOVE, mouseMoveMock);
      window.dispatchEvent(new MouseEvent(MouseMoveEventType.MOUSE_MOVE));

      expect(mouseMoveMock).toHaveBeenCalledTimes(1);
    });

    it('publishes nothing if the return from the normalizer is falsy', () => {
      const mouseUpMock = jest.fn();
      const event = new MouseEvent('mouseup');

      Object.defineProperty(event, 'target', {
        value: null,
        writable: true
      });

      observer.subscribe(MOUSE_UP, mouseUpMock);
      context.dispatchEvent(event);

      expect(mouseUpMock).not.toHaveBeenCalled();
    });
  });

  describe('destroyEventListeners', () => {
    it('destroys all created event listeners', () => {
      const destroyEventListenerSpy = jest.spyOn(manager as any, 'destroyEventListener');
      const removeEventListenerSpy = jest.spyOn(context, 'removeEventListener');

      observer.publish(DestroyEventType.DESTROY);

      expect(destroyEventListenerSpy).toHaveBeenCalled();
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('handleMouseUp', () => {
    it('calls handleLeftMouseUp if the mouse button is MouseButton.LEFT', () => {
      const handleLeftMouseUpSpy = jest.spyOn(manager as any, 'handleLeftMouseUp');
      const event = {
        button: LEFT,
        originalEvent: {
          target: context
        }
      };

      observer.publish(MOUSE_UP, event);

      expect(handleLeftMouseUpSpy).toHaveBeenCalledTimes(1);
      expect(handleLeftMouseUpSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('handleLeftMouseUp', () => {
    let event: {};

    beforeEach(() => {
      event = {
        button: LEFT,
        originalEvent: {
          target: context
        }
      };
    });

    it('calls setPotentialDraggable', () => {
      const setPotentialDraggableSpy = jest.spyOn(manager as any, 'setPotentialDraggable');

      observer.publish(MOUSE_UP, event);

      expect(setPotentialDraggableSpy).toBeCalledTimes(1);
      expect(setPotentialDraggableSpy).toBeCalledWith(undefined);
    });

    it('calls checkForLeftClick', () => {
      const checkForLeftClickSpy = jest.spyOn(manager as any, 'checkForLeftClick');

      observer.publish(MOUSE_UP, event);

      expect(checkForLeftClickSpy).toHaveBeenCalledTimes(1);
      expect(checkForLeftClickSpy).toHaveBeenCalledWith(event);
    });

    it('calls checkForDragEnd', () => {
      const checkForDragEndSpy = jest.spyOn(manager as any, 'checkForDragEnd');

      observer.publish(MOUSE_UP, event);

      expect(checkForDragEndSpy).toHaveBeenCalledTimes(1);
      expect(checkForDragEndSpy).toHaveBeenCalledWith(event);
    });

    it('calls setPotentialClickable', () => {
      const setPotentialClickableSpy = jest.spyOn(manager as any, 'setPotentialClickable');

      observer.publish(MOUSE_UP, event);

      expect(setPotentialClickableSpy).toHaveBeenCalledTimes(1);
      expect(setPotentialClickableSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('handleMouseDown', () => {
    it('calls handleLeftMouseDown if the mouse button is MouseButton.LEFT', () => {
      const handleLeftMouseDownSpy = jest.spyOn(manager as any, 'handleLeftMouseDown');
      const event = {
        button: LEFT,
        originalEvent: {
          target: context
        },
        position: {
          x: 100,
          y: 200
        },
        target: {
          originalTarget: document.createElement('div')
        }
      };

      observer.publish(MOUSE_DOWN, event);

      expect(handleLeftMouseDownSpy).toHaveBeenCalledTimes(1);
      expect(handleLeftMouseDownSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('handleLeftMouseDown', () => {
    it('calls checkForPotentialDraggable', () => {
      const checkForPotentialDraggableSpy = jest.spyOn(manager as any, 'checkForPotentialDraggable');
      const event = {
        button: LEFT,
        originalEvent: {
          target: context
        },
        position: {
          x: 100,
          y: 200
        },
        target: {
          originalTarget: document.createElement('div')
        }
      };

      observer.publish(MOUSE_DOWN, event);

      expect(checkForPotentialDraggableSpy).toHaveBeenCalledTimes(1);
      expect(checkForPotentialDraggableSpy).toHaveBeenCalledWith(event);
    });

    it('calls setPotentialClickable', () => {
      const setPotentialClickableSpy = jest.spyOn(manager as any, 'setPotentialClickable');
      const event = {
        button: LEFT,
        originalEvent: {
          target: context
        },
        position: {
          x: 100,
          y: 200
        },
        target: {
          originalTarget: document.createElement('div')
        }
      };

      observer.publish(MOUSE_DOWN, event);

      expect(setPotentialClickableSpy).toHaveBeenCalledTimes(1);
      expect(setPotentialClickableSpy).toHaveBeenCalledWith(event.target.originalTarget);
    });
  });

  describe('updateContext', () => {
    it('calls setContextOffset', () => {
      const setContextOffsetSpy = jest.spyOn(manager as any, 'setContextOffset');
      const topOffset = 10;
      const leftOffset = 20;
      context.getBoundingClientRect = jest.fn(() => ({ top: topOffset, left: leftOffset })) as any;

      const contextRect = { top: topOffset, left: leftOffset };
      const mockEvent = { contextRect };

      observer.publish(ContainerEventType.DIAGRAM_MAKER_CONTAINER_UPDATE, mockEvent);

      expect(setContextOffsetSpy).toBeCalledTimes(1);
      expect(setContextOffsetSpy).toBeCalledWith({ x: leftOffset, y: topOffset });
    });
  });

  describe('checkForPotentialDraggable', () => {
    it('calls setPotentialDraggable', () => {
      const setPotentialDraggableSpy = jest.spyOn(manager as any, 'setPotentialDraggable');
      const target = document.createElement('div');
      target.setAttribute(EventAttribute.DATA_DRAGGABLE, 'true');

      observer.publish(MOUSE_DOWN, {
        button: LEFT,
        originalEvent: {
          target
        },
        position: {
          x: 100,
          y: 200
        },
        target: {
          originalTarget: document.createElement('div')
        }
      });

      expect(setPotentialDraggableSpy).toBeCalledTimes(1);
      expect(setPotentialDraggableSpy).toBeCalledWith(target);
    });

    it('calls setCurrentDragOffset', () => {
      const testPosition = { x: 100, y: 200 };
      const setCurrentDragOffsetSpy = jest.spyOn(manager as any, 'setCurrentDragOffset');
      const target = document.createElement('div');
      const button = LEFT;
      target.setAttribute(EventAttribute.DATA_DRAGGABLE, 'true');

      observer.publish(MOUSE_DOWN, {
        button,
        offset: { x: 0, y: 0 },
        originalEvent: {
          target
        },
        position: testPosition,
        target: {
          originalTarget: document.createElement('div')
        }
      });

      const targetPagePosition = fromScreenToPage(target.getBoundingClientRect());
      const pagePosition = fromContainerToPage(testPosition, contextOffset);
      const expectedOffset = subtract(pagePosition, targetPagePosition);

      expect(setCurrentDragOffsetSpy).toBeCalledTimes(1);
      expect(setCurrentDragOffsetSpy).toBeCalledWith(expectedOffset);
    });

    it('calls setCurrentDragOffset when event element is not draggable, but parent element is draggable', () => {
      const setCurrentDragOffsetSpy = jest.spyOn(manager as any, 'setCurrentDragOffset');

      // Mock the position of the target element
      jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementationOnce(() => ({
        bottom: 0,
        height: 120,
        left: 30, // Left offset
        right: 0,
        top: 20, // Top offset
        width: 120
      }) as any);

      const targetParent = document.createElement('div');
      const targetChild = document.createElement('div');
      targetParent.setAttribute(EventAttribute.DATA_DRAGGABLE, 'true');
      targetParent.appendChild(targetChild);

      const button = LEFT;

      observer.publish(MOUSE_DOWN, {
        button,
        offset: { x: 100, y: 200 },
        originalEvent: {
          target: targetChild
        },
        position: {
          x: 100,
          y: 200
        },
        target: {
          originalTarget: document.createElement('div')
        }
      });

      expect(setCurrentDragOffsetSpy).toBeCalledTimes(1);
      expect(setCurrentDragOffsetSpy).toBeCalledWith({ x: 70, y: 180 });
    });

    it('calls setDragReference', () => {
      const testPosition = { x: 100, y: 200 };
      const setDragReferenceSpy = jest.spyOn(manager as any, 'setDragReference');
      const target = document.createElement('div');
      const button = LEFT;
      target.setAttribute(EventAttribute.DATA_DRAGGABLE, 'true');

      observer.publish(MOUSE_DOWN, {
        button,
        offset: { x: 0, y: 0 },
        originalEvent: {
          target
        },
        position: testPosition,
        target: {
          originalTarget: document.createElement('div')
        }
      });

      const targetPagePosition = fromScreenToPage(target.getBoundingClientRect());

      expect(setDragReferenceSpy).toBeCalledTimes(1);
      expect(setDragReferenceSpy).toBeCalledWith(targetPagePosition);
    });

    it('returns without calling anything if there is no valid target', () => {
      const offset = { x: 100, y: 100 };
      const setCurrentDragOffsetSpy = jest.spyOn(manager as any, 'setCurrentDragOffset');
      const setPotentialDraggableSpy = jest.spyOn(manager as any, 'setPotentialDraggable');
      const target = document.createElement('div');
      const button = LEFT;

      observer.publish(MOUSE_DOWN, {
        button,
        offset,
        originalEvent: {
          target
        },
        position: {
          x: 100,
          y: 200
        },
        target: {
          originalTarget: document.createElement('div')
        }
      });

      expect(setCurrentDragOffsetSpy).not.toHaveBeenCalled();
      expect(setPotentialDraggableSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleMouseMove', () => {
    let event: {};

    beforeEach(() => {
      event = {};
    });

    it('calls checkForDrag', () => {
      const checkForDragSpy = jest.spyOn(manager as any, 'checkForDrag');

      observer.publish(MOUSE_MOVE, event);

      expect(checkForDragSpy).toHaveBeenCalledTimes(1);
      expect(checkForDragSpy).toHaveBeenCalledWith(event);
    });

    it('calls checkForDragOver', () => {
      const checkForDragOverSpy = jest.spyOn(manager as any, 'checkForDragOver');

      observer.publish(MOUSE_MOVE, event);

      expect(checkForDragOverSpy).toHaveBeenCalledTimes(1);
      expect(checkForDragOverSpy).toHaveBeenCalledWith(event);
    });

    it('calls checkForDragLeave', () => {
      const checkForDragLeaveSpy = jest.spyOn(manager as any, 'checkForDragLeave');

      observer.publish(MOUSE_MOVE, event);

      expect(checkForDragLeaveSpy).toHaveBeenCalledTimes(1);
      expect(checkForDragLeaveSpy).toHaveBeenCalledWith(event);
    });

    it('calls checkForDragStart', () => {
      const checkForDragStartSpy = jest.spyOn(manager as any, 'checkForDragStart');

      observer.publish(MOUSE_MOVE, event);

      expect(checkForDragStartSpy).toHaveBeenCalledTimes(1);
      expect(checkForDragStartSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('checkForDrag', () => {
    beforeEach(() => {
      mockGetDropZoneTarget(() => document.createElement('div'));
    });

    it('publishes DRAG if we are currently dragging an item', () => {
      const dragMock = jest.fn();
      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });

      observer.subscribe(DRAG, dragMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragMock).toHaveBeenCalledTimes(1);
    });

    it('attaches the proper type when the DRAG event is published', () => {
      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });

      observer.subscribe(DRAG, (event: NormalizedDragEvent) => {
        expect(event.type).toEqual(DragEventType.DRAG);
      });

      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });
    });

    it('does not publish DRAG if we are not currently dragging an item', () => {
      const dragMock = jest.fn();

      observer.subscribe(DRAG, dragMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragMock).not.toHaveBeenCalled();
    });
  });

  describe('checkForDragLeave', () => {
    beforeEach(() => {
      mockGetDropZoneTarget(() => undefined);
    });

    it('attaches the proper type when DRAG_LEAVE is published', () => {
      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });

      observer.subscribe(DRAG_LEAVE, (event: NormalizedDropEvent) => {
        expect(event.type).toEqual(DropEventType.DRAG_LEAVE);
      });

      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });
    });

    it('publishes DRAG_LEAVE if we exit a drop zone', () => {
      const dragLeaveMock = jest.fn();

      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });

      observer.subscribe(DRAG_LEAVE, dragLeaveMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragLeaveMock).toHaveBeenCalledTimes(1);
    });

    it('calls setCurrentDropTarget if we exit a drop zone', () => {
      const setCurrentDropTargetSpy = jest.spyOn(manager as any, 'setCurrentDropTarget');

      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });

      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(setCurrentDropTargetSpy).toHaveBeenCalledTimes(1);
      expect(setCurrentDropTargetSpy).toHaveBeenCalledWith(undefined);
    });

    it('does not publish DRAG_LEAVE if currentDropTarget is not set', () => {
      const dragLeaveMock = jest.fn();

      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });

      observer.subscribe(DRAG_LEAVE, dragLeaveMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragLeaveMock).not.toHaveBeenCalled();
    });

    it('does not publish DRAG_LEAVE if currentDraggable is not set', () => {
      const dragLeaveMock = jest.fn();

      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });

      observer.subscribe(DRAG_LEAVE, dragLeaveMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragLeaveMock).not.toHaveBeenCalled();
    });
  });

  describe('checkForDragOver', () => {
    let event: {};

    beforeEach(() => {
      event = {
        position: { x: 1, y: 1 }
      };
      mockGetDropZoneTarget(() => document.createElement('div'));
    });

    it('attaches the proper type when DRAG_OVER is published', () => {
      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });

      observer.subscribe(DRAG_OVER, (e: NormalizedDropEvent) => {
        expect(e.type).toBe(DropEventType.DRAG_OVER);
      });
      observer.publish(MOUSE_MOVE, event);
    });

    it('publishes DRAG_OVER', () => {
      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });

      const dragOverMock = jest.fn();

      observer.subscribe(DRAG_OVER, dragOverMock);
      observer.publish(MOUSE_MOVE, event);

      expect(dragOverMock).toHaveBeenCalledTimes(1);
    });

    it('does not publish DRAG_OVER if nothing is currently being dragged', () => {
      const dragOverMock = jest.fn();

      observer.subscribe(DRAG_OVER, dragOverMock);
      observer.publish(MOUSE_MOVE, event);

      expect(dragOverMock).not.toHaveBeenCalledTimes(1);
    });
  });

  describe('checkForDrop', () => {
    let event: {};

    beforeEach(() => {
      event = {
        button: LEFT,
        originalEvent: {
          target: context
        }
      };
    });

    it('attaches the proper type when DROP is published', () => {
      const dropzone = document.createElement('div');

      dropzone.setAttribute('data-dropzone', 'true');

      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDropTarget', { value: dropzone, writable: true });

      observer.subscribe(DROP, (e: NormalizedDropEvent) => {
        expect(e.type).toEqual(DropEventType.DROP);
      });
      observer.publish(MOUSE_UP, event);
    });

    it('publishes DROP', () => {
      const dropMock = jest.fn();
      const dropzone = document.createElement('div');

      dropzone.setAttribute('data-dropzone', 'true');

      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDropTarget', { value: dropzone, writable: true });

      observer.subscribe(DROP, dropMock);
      observer.publish(MOUSE_UP, event);

      expect(dropMock).toHaveBeenCalled();
    });

    it('does not publish DROP if there is not a dropzone', () => {
      const dropMock = jest.fn();

      Object.defineProperty(manager, 'currentDraggable', { value: context, writable: true });

      observer.subscribe(DROP, dropMock);
      observer.publish(MOUSE_UP, event);

      expect(dropMock).not.toHaveBeenCalled();
    });

    it('does not publish DROP if nothing is being dragged', () => {
      const dropMock = jest.fn();

      observer.subscribe(DROP, dropMock);
      observer.publish(MOUSE_UP, event);

      expect(dropMock).not.toHaveBeenCalled();
    });
  });

  describe('checkForLeftClick', () => {
    let event: {};

    beforeEach(() => {
      event = {
        button: LEFT,
        originalEvent: {
          target: context
        }
      };
    });

    it('does not publish LEFT_CLICK if mouse down did not create a potential clickable', () => {
      const leftClickMock = jest.fn();

      observer.subscribe(LEFT_CLICK, leftClickMock);
      observer.publish(MOUSE_UP, event);

      expect(leftClickMock).not.toHaveBeenCalled();
    });

    it('does not publish LEFT_CLICK if something is being dragged', () => {
      const leftClickMock = jest.fn();
      const currentDraggable = document.createElement('div');
      const potentialClickable = document.createElement('div');

      Object.defineProperty(manager, 'currentDraggable', { value: currentDraggable, writable: true });
      Object.defineProperty(manager, 'potentialClickable', { value: potentialClickable, writable: true });

      observer.subscribe(LEFT_CLICK, leftClickMock);
      observer.publish(MOUSE_UP, event);

      expect(leftClickMock).not.toHaveBeenCalled();
    });

    it('does not publish LEFT_CLICK if the target doesnt match the mouse down target', () => {
      const leftClickMock = jest.fn();
      const potentialClickable = document.createElement('div');

      Object.defineProperty(manager, 'potentialClickable', { value: potentialClickable, writable: true });

      observer.subscribe(LEFT_CLICK, leftClickMock);
      observer.publish(MOUSE_UP, {
        button: LEFT,
        originalEvent: {
          target: undefined
        },
        target: {
          originalTarget: document.createElement('div')
        }
      });

      expect(leftClickMock).not.toHaveBeenCalled();
    });

    it('publishes LEFT_CLICK if the target matches the mouse down target', () => {
      const leftClickMock = jest.fn();
      const potentialClickable = document.createElement('div');

      Object.defineProperty(manager, 'potentialClickable', { value: potentialClickable, writable: true });

      const mouseUpEvent = {
        button: LEFT,
        originalEvent: {
          target: undefined
        },
        target: {
          originalTarget: potentialClickable
        }
      };

      observer.subscribe(LEFT_CLICK, leftClickMock);
      observer.publish(MOUSE_UP, mouseUpEvent);

      expect(leftClickMock).toHaveBeenCalledTimes(1);
      expect(leftClickMock).toHaveBeenCalledWith({
        ...mouseUpEvent,
        type: MouseClickEventType.LEFT_CLICK
      });
    });
  });

  describe('checkForDragEnd', () => {
    let event: {};

    beforeEach(() => {
      event = {
        button: LEFT,
        originalEvent: {
          target: document.createElement('div')
        }
      };
    });

    it('does not publish DRAG_END if something is not being dragged', () => {
      const dragEndMock = jest.fn();

      observer.subscribe(DRAG_END, dragEndMock);
      observer.publish(MOUSE_UP, event);

      expect(dragEndMock).not.toHaveBeenCalled();
    });

    it('attaches the proper type when publishing DRAG_END', () => {
      Object.defineProperty(manager, 'currentDraggable', { value: document.createElement('div'), writable: true });

      observer.subscribe(DRAG_END, (e: NormalizedDragEvent) => {
        expect(e.type).toEqual(DragEventType.DRAG_END);
      });
      observer.publish(MOUSE_UP, event);
    });

    it('publishes DRAG_END', () => {
      const dragEndMock = jest.fn();

      Object.defineProperty(manager, 'currentDraggable', { value: document.createElement('div'), writable: true });

      observer.subscribe(DRAG_END, dragEndMock);
      observer.publish(MOUSE_UP, event);

      expect(dragEndMock).toHaveBeenCalled();
    });
  });

  describe('checkForDragStart', () => {

    beforeEach(() => {
      mockGetElementsFromPoint(() => [document.createElement('div')]);
    });

    it('attaches the proper type when DRAG_START is published', () => {
      Object.defineProperty(manager, 'potentialDraggable', { value: document.createElement('div'), writable: true });

      observer.subscribe(DRAG_START, (e: NormalizedDragEvent) => {
        expect(e.type).toEqual(DragEventType.DRAG_START);
      });
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });
    });

    it('publishes DRAG_START', () => {
      const dragStartMock = jest.fn();

      Object.defineProperty(manager, 'potentialDraggable', { value: document.createElement('div'), writable: true });

      observer.subscribe(DRAG_START, dragStartMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragStartMock).toHaveBeenCalledTimes(1);
    });

    it('calls setCurrentDraggable', () => {
      const setCurrentDraggableSpy = jest.spyOn(manager as any, 'setCurrentDraggable');
      const potentialDraggable = document.createElement('div');

      Object.defineProperty(manager, 'potentialDraggable', { value: potentialDraggable, writable: true });

      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(setCurrentDraggableSpy).toHaveBeenCalledTimes(1);
      expect(setCurrentDraggableSpy).toHaveBeenCalledWith(potentialDraggable);
    });

    it('returns without publishing if something is being dragged', () => {
      const dragStartMock = jest.fn();

      Object.defineProperty(manager, 'potentialDraggable', { value: document.createElement('div'), writable: true });
      Object.defineProperty(manager, 'currentDraggable', { value: document.createElement('div'), writable: true });

      observer.subscribe(DRAG_START, dragStartMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragStartMock).not.toHaveBeenCalled();
    });

    it('returns without publishing if we do not have a potentialDraggable', () => {
      const dragStartMock = jest.fn();

      observer.subscribe(DRAG_START, dragStartMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragStartMock).not.toHaveBeenCalled();
    });
  });

  describe('checkForDragEnter', () => {
    let dragEnterMock: () => void;

    beforeEach(() => {
      dragEnterMock = jest.fn();
    });

    it('does not do anything if the dropzone has not changed', () => {
      const element = document.createElement('div');

      mockGetDropZoneTarget(() => element);

      Object.defineProperty(manager, 'currentDropTarget', { value: element, writable: true });
      Object.defineProperty(manager, 'currentDraggable', { value: element, writable: true });

      observer.subscribe(DRAG_ENTER, dragEnterMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragEnterMock).not.toHaveBeenCalled();
    });

    it('does not do anything if nothing is being dragged', () => {
      mockGetDropZoneTarget(() => document.createElement('div'));

      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });

      observer.subscribe(DRAG_ENTER, dragEnterMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragEnterMock).not.toHaveBeenCalled();
    });

    it('does not do anything if there is not a valid dropzone', () => {
      mockGetDropZoneTarget(() => undefined);

      const element = document.createElement('div');

      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDraggable', { value: element, writable: true });

      observer.subscribe(DRAG_ENTER, dragEnterMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragEnterMock).not.toHaveBeenCalled();
    });

    it('attaches the proper type when DRAG_ENTER is published', () => {
      const element = document.createElement('div');

      mockGetDropZoneTarget(() => element);

      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDraggable', { value: element, writable: true });

      observer.subscribe(DRAG_ENTER, (e: NormalizedDropEvent) => {
        expect(e.type).toEqual(DropEventType.DRAG_ENTER);
      });

      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });
    });

    it('publishes DRAG_ENTER', () => {
      const element = document.createElement('div');

      mockGetDropZoneTarget(() => element);

      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDraggable', { value: element, writable: true });

      observer.subscribe(DRAG_ENTER, dragEnterMock);
      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(dragEnterMock).toHaveBeenCalledTimes(1);
    });

    it('calls setCurrentDropTarget', () => {
      const element = document.createElement('div');

      mockGetDropZoneTarget(() => element);

      const setCurrentDropTargetSpy = jest.spyOn(manager as any, 'setCurrentDropTarget');

      Object.defineProperty(manager, 'currentDropTarget', { value: context, writable: true });
      Object.defineProperty(manager, 'currentDraggable', { value: element, writable: true });

      observer.publish(MOUSE_MOVE, { position: { x: 0, y: 0 } });

      expect(setCurrentDropTargetSpy).toHaveBeenCalledTimes(1);
      expect(setCurrentDropTargetSpy).toHaveBeenCalledWith(element);
    });
  });
});
