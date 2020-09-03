
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  ContainerEventType,
  DragEventType,
  KeyboardEventType,
  MouseClickEventType,
  WheelEventType,
  WindowEventType
} from 'diagramMaker/service/ui/UIEventManager';
import { NormalizedEvent } from 'diagramMaker/service/ui/UIEventNormalizer';

import readOnlyEventFilter from './readOnlyEventFilter';

describe('readOnlyEventFilter', () => {
  it('allows all MOUSE_WHEEL events, regardless of the target', () => {
    const event = {
      type: WheelEventType.MOUSE_WHEEL
    };

    const result = readOnlyEventFilter(event as NormalizedEvent);

    expect(result).toBe(true);
  });

  it('allows all WORKSPACE_RESIZE events, regardless of the target', () => {
    const event = {
      type: ContainerEventType.DIAGRAM_MAKER_CONTAINER_UPDATE
    };

    const result = readOnlyEventFilter(event as NormalizedEvent);

    expect(result).toBe(true);
  });

  it('allows DRAG events when the target is the workspace', () => {
    const event = {
      target: {
        type: DiagramMakerComponentsType.WORKSPACE
      },
      type: DragEventType.DRAG
    };

    const result = readOnlyEventFilter(event as NormalizedEvent);

    expect(result).toBe(true);
  });

  it('does not allow DRAG events when the target is not the workspace', () => {
    const event = {
      target: {
        type: DiagramMakerComponentsType.NODE
      },
      type: DragEventType.DRAG
    };

    const result = readOnlyEventFilter(event as NormalizedEvent);

    expect(result).toBeFalsy();
  });

  it('does not allow any events except DRAG and MOUSE_WHEEL regardless of the target', () => {
    const eventTypesToTest = [
      MouseClickEventType.LEFT_CLICK,
      WindowEventType.RESIZE,
      KeyboardEventType.KEY_UP
    ];

    eventTypesToTest.forEach((type) => {
      const event = { type };

      const result = readOnlyEventFilter(event as NormalizedEvent);

      expect(result).toBe(false);
    });
  });
});
