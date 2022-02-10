import { Store } from 'redux';

import { DiagramMakerData, Position, Size } from 'diagramMaker/state/types';
import {
  DeselectAction,
  DragWorkspaceAction,
  ResizeWorkspaceAction,
  ResizeWorkspaceCanvasAction,
  SelectAllAction,
  WorkspaceActionsType,
  WorkspaceResetZoomAction,
  ZoomWorkspaceAction,
} from './workspaceActions';

export function createDragWorkspaceAction(position: Position): DragWorkspaceAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_DRAG,
    payload: { position },
  };
}

export function createZoomWorkspaceAction(zoom: number, position: Position): ZoomWorkspaceAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_ZOOM,
    payload: { zoom, position },
  };
}

export function createWorkspaceResetZoomAction(): WorkspaceResetZoomAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_RESET_ZOOM,
  };
}

function createDeselectAction(): DeselectAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_DESELECT,
  };
}

function createResizeWorkspaceAction(containerSize: Size): ResizeWorkspaceAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_RESIZE,
    payload: { containerSize },
  };
}

export function createResizeWorkspaceCanvasAction(canvasSize: Size): ResizeWorkspaceCanvasAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_CANVAS_RESIZE,
    payload: { canvasSize },
  };
}

function createSelectAllAction(): SelectAllAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_SELECT_ALL,
  };
}

export function handleWorkspaceDrag<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  position: Position,
) {
  const action = createDragWorkspaceAction(position);
  store.dispatch(action);
}

export function handleWorkspaceZoom<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  zoom: number,
  position: Position,
) {
  const action = createZoomWorkspaceAction(zoom, position);
  store.dispatch(action);
}

export function handleWorkspaceClick<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
) {
  const action = createDeselectAction();
  store.dispatch(action);
}

export function handleWorkspaceResize<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  containerSize: Size,
) {
  const action = createResizeWorkspaceAction(containerSize);
  store.dispatch(action);
}

export function handleSelectAll<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
) {
  const action = createSelectAllAction();
  store.dispatch(action);
}
