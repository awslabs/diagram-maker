import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { ContainerEventType, DragEventType, WheelEventType } from 'diagramMaker/service/ui/UIEventManager';
import { NormalizedDragEvent, NormalizedEvent } from 'diagramMaker/service/ui/UIEventNormalizer';

const { WORKSPACE } = DiagramMakerComponentsType;

export default function readOnlyEventFilter(event: NormalizedEvent): boolean {
  const { type } = event;

  switch (type) {
    case ContainerEventType.DIAGRAM_MAKER_CONTAINER_UPDATE:
    case WheelEventType.MOUSE_WHEEL:
      return true;
    case DragEventType.DRAG: {
      const { target } = event as NormalizedDragEvent;
      return target.type === WORKSPACE;
    }
    default: return false;
  }
}
