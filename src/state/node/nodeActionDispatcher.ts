import { Store } from 'redux';
import { v4 as uuid } from 'uuid';

import ConfigService from 'diagramMaker/service/ConfigService';
import { getCenteredPosition } from 'diagramMaker/service/positionUtils';
import { NormalizedTarget } from 'diagramMaker/service/ui/UITargetNormalizer';
import {
  DiagramMakerData,
  DiagramMakerPotentialNode,
  Position,
  Rectangle,
  Size
} from 'diagramMaker/state/types';

import {
  CreateNodeAction, DragEndNodeAction, DragEndPotentialNodeAction, DragNodeAction, DragPotentialNodeAction,
  DragStartNodeAction, DragStartPotentialNodeAction, NodeActionsType, SelectNodeAction
} from './nodeActions';

export const MARGIN_PX = 10;

function createSelectNodeAction(id: string): SelectNodeAction {
  return {
    type: NodeActionsType.NODE_SELECT,
    payload: { id }
  };
}

function createDragStartNodeAction(id: string): DragStartNodeAction {
  return {
    type: NodeActionsType.NODE_DRAG_START,
    payload: { id }
  };
}

function createDragEndNodeAction(id: string): DragEndNodeAction {
  return {
    type: NodeActionsType.NODE_DRAG_END,
    payload: { id }
  };
}

function createDragNodeAction(
  id: string,
  position: Position,
  workspaceRectangle: Rectangle,
  size: Size
): DragNodeAction {
  return {
    type: NodeActionsType.NODE_DRAG,
    payload: { id, position, workspaceRectangle, size }
  };
}

function createPotentialNodeDragStartAction(
  typeId: string, position: Position, size: Size
): DragStartPotentialNodeAction {
  return {
    type: NodeActionsType.POTENTIAL_NODE_DRAG_START,
    payload: { typeId, position, size }
  };
}

function createPotentialNodeDragAction(position: Position, workspaceRectangle: Rectangle): DragPotentialNodeAction {
  return {
    type: NodeActionsType.POTENTIAL_NODE_DRAG,
    payload: { position, workspaceRectangle }
  };
}

function createPotentialNodeDragEndAction(): DragEndPotentialNodeAction {
  return {
    type: NodeActionsType.POTENTIAL_NODE_DRAG_END
  };
}

function createNewNodeAction<NodeType>(
  id: string, typeId: string, position: Position, size: Size
): CreateNodeAction<NodeType> {
  return {
    type: NodeActionsType.NODE_CREATE,
    payload: { id, typeId, position, size }
  };
}

function getSizeFromDataAttrs(target: NormalizedTarget): Size | undefined {
  const width = target.originalTarget.getAttribute('data-width');
  const height = target.originalTarget.getAttribute('data-height');
  if (width && height) {
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);
    if (!isNaN(parsedWidth) && !isNaN(parsedHeight)) {
      return { width: parsedWidth, height: parsedHeight };
    }
  }
  return;
}

export function handleNodeClick<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined
) {
  if (id) {
    const action = createSelectNodeAction(id);
    store.dispatch(action);
  }
}

export function handleNodeDragStart<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined
) {
  if (id) {
    const action = createDragStartNodeAction(id);
    store.dispatch(action);
  }
}

export function handleNodeDrag<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  position: Position
) {
  if (id) {
    const { canvasSize } = store.getState().workspace;
    const workspaceRectangle = {
      position: { x: 0, y: 0 },
      size: canvasSize
    };
    const node = store.getState().nodes[id];
    if (node) {
      const size = node.diagramMakerData.size;
      const action = createDragNodeAction(id, position, workspaceRectangle, size);
      store.dispatch(action);
    }
  }
}

export function handleNodeDragEnd<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined
) {
  if (id) {
    const action = createDragEndNodeAction(id);
    store.dispatch(action);

  }
}

export function handlePotentialNodeDragStart<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  config: ConfigService<NodeType, EdgeType>,
  target: NormalizedTarget,
  position: Position
) {
  const typeId = target.id;
  if (typeId) {
    const size = getSizeFromDataAttrs(target) || config.getSizeForNodeType(typeId);
    if (size) {
      const action = createPotentialNodeDragStartAction(typeId, getCenteredPosition(position, size), size);
      store.dispatch(action);
    }
  }
}

export function handlePotentialNodeDrag<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  position: Position
) {

  const { canvasSize } = store.getState().workspace;
  const workspaceRectangle = {
    position: { x: 0, y: 0 },
    size: canvasSize
  };
  const potentialNode = store.getState().potentialNode as DiagramMakerPotentialNode;
  const size = potentialNode.size;
  const action = createPotentialNodeDragAction(getCenteredPosition(position, size), workspaceRectangle);

  store.dispatch(action);
}

export function handlePotentialNodeDragEnd<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  typeId: string | undefined
) {
  if (typeId) {
    const action = createPotentialNodeDragEndAction();
    store.dispatch(action);
  }
}

export function handleNodeCreate<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  typeId: string | undefined
) {
  if (typeId) {
    const id = `dm-node-${uuid()}`;
    const state = store.getState();
    const potentialNode = state.potentialNode;
    if (potentialNode) {
      const { position, size } = potentialNode;
      const action = createNewNodeAction(id, typeId, position, size);
      store.dispatch(action);
    }
  }
}
