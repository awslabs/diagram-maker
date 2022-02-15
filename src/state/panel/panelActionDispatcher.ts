import { Store } from 'redux';

import { DiagramMakerComponents } from 'diagramMaker/service/ui/types';
import { DiagramMakerData, Position, Size } from 'diagramMaker/state/types';

import {
  DragPanelAction,
  DragStartPanelAction,
  PanelActionsType,
  ResizePanelAction,
} from './panelActions';

function getPanelAttributeAsBoolean(target: Element): boolean {
  const value = target.getAttribute('data-type');

  if (!value) {
    return false;
  }

  if (value === DiagramMakerComponents.PANEL) {
    return true;
  }

  return false;
}

function getPanelElement(dragHandleElement: HTMLElement): HTMLElement | undefined {
  let currentTarget = dragHandleElement;

  while (!getPanelAttributeAsBoolean(currentTarget) && currentTarget.parentElement) {
    currentTarget = currentTarget.parentElement;
  }

  return (getPanelAttributeAsBoolean(currentTarget) && currentTarget) || undefined;
}

function getDraggablePanelOffset(dragHandleElement: HTMLElement): Position {
  const panelElement = getPanelElement(dragHandleElement);

  if (panelElement) {
    const dragHandleRect = dragHandleElement.getBoundingClientRect();
    const panelRect = panelElement.getBoundingClientRect();

    return {
      x: dragHandleRect.left - panelRect.left,
      y: dragHandleRect.top - panelRect.top,
    };
  }
  return { x: 0, y: 0 };
}

function getDraggablePanelPosition(dragHandleElement: HTMLElement, normalizedPosition: Position): Position {
  const draggablePanelOffset = getDraggablePanelOffset(dragHandleElement);

  return {
    x: normalizedPosition.x - draggablePanelOffset.x,
    y: normalizedPosition.y - draggablePanelOffset.y,
  };
}

function createResizePanelAction(id: string, size: Size): ResizePanelAction {
  return {
    type: PanelActionsType.PANEL_RESIZE,
    payload: { id, size },
  };
}

function createDragPanelAction(id: string, position: Position, viewContainerSize: Size): DragPanelAction {
  return {
    type: PanelActionsType.PANEL_DRAG,
    payload: { id, position, viewContainerSize },
  };
}

function createDragPanelStartAction(id: string): DragStartPanelAction {
  return {
    type: PanelActionsType.PANEL_DRAG_START,
    payload: { id },
  };
}

export function handlePanelResize<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  size: Size,
) {
  if (id) {
    const action = createResizePanelAction(id, size);
    store.dispatch(action);
  }
}

export function handlePanelDrag<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  draggableElement: HTMLElement,
  normalizedPosition: Position,
  viewContainerSize: Size,
) {
  if (id) {
    const position = getDraggablePanelPosition(draggableElement, normalizedPosition);
    const action = createDragPanelAction(id, position, viewContainerSize);
    store.dispatch(action);
  }
}

export function handlePanelDragStart<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
) {
  if (id) {
    const action = createDragPanelStartAction(id);
    store.dispatch(action);
  }
}
