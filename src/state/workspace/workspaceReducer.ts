import { Draft, produce } from 'immer';
import { clamp } from 'lodash-es';

import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { EditorActionsType, FitAction, FocusNodeAction } from 'diagramMaker/state/editor/editorActions';
import { NodeActionsType } from 'diagramMaker/state/node/nodeActions';
import { DiagramMakerWorkspace, Position, Size } from 'diagramMaker/state/types';
import {
  createDragWorkspaceAction,
  createResizeWorkspaceCanvasAction,
} from 'diagramMaker/state/workspace/workspaceActionDispatcher';
import {
  DragWorkspaceAction, ResizeWorkspaceAction, ResizeWorkspaceCanvasAction, WorkspaceActionsType, ZoomWorkspaceAction,
} from 'diagramMaker/state/workspace/workspaceActions';

const ZoomDefaults = {
  MAX: 3,
  MIN: 0.3,
  SPEED: 0.006,
};

const FIT_BUFFER = 50;

export function getDefaultWorkspaceState(): DiagramMakerWorkspace {
  return {
    position: {
      x: 0,
      y: 0,
    },
    scale: 1,
    canvasSize: {
      width: 3200,
      height: 1600,
    },
    viewContainerSize: {
      width: 1600,
      height: 800,
    },
  };
}

const clampPosition = (position: Position, size: Size, zoom: number, containerSize: Size): Position => {
  const x = clamp(position.x, -1 * Math.max(0, size.width * zoom - containerSize.width), 0);
  const y = clamp(position.y, -1 * Math.max(0, size.height * zoom - containerSize.height), 0);

  return { x, y };
};

const clampZoom = (zoom: number, size: Size, containerSize: Size): number => {
  const zoomMin = Math.max(ZoomDefaults.MIN, containerSize.width / size.width, containerSize.height / size.height);

  const clampedZoom = Math.max(zoomMin, Math.min(ZoomDefaults.MAX, zoom));
  return Number(clampedZoom.toPrecision(4));
};

const getNewZoomLevel = (currentState: Draft<DiagramMakerWorkspace>, action: ZoomWorkspaceAction): number => {
  const zoom = currentState.scale;
  const zoomFactor = Math.max(-1, Math.min(1, zoom)) * ZoomDefaults.SPEED;
  const containerSize = currentState.viewContainerSize;
  const newZoom = clampZoom(zoom + action.payload.zoom * zoomFactor, currentState.canvasSize, containerSize);

  return newZoom;
};

const getNewZoomPosition = (
  position: Position,
  workspacePosition: Position,
  zoom: number,
  newZoom: number,
): Position => {
  const zoomTargetX = (position.x - workspacePosition.x) / zoom;
  const zoomTargetY = (position.y - workspacePosition.y) / zoom;

  const x = Math.round(-1 * zoomTargetX * newZoom + position.x);
  const y = Math.round(-1 * zoomTargetY * newZoom + position.y);

  return { x, y };
};

const getNewDragPosition = (currentState: Draft<DiagramMakerWorkspace>, action: DragWorkspaceAction): Position => {
  const { x } = action.payload.position;
  const { y } = action.payload.position;
  const containerSize = currentState.viewContainerSize;

  const newPosition = clampPosition({ x, y }, currentState.canvasSize, currentState.scale, containerSize);

  return newPosition;
};

const zoomReducer = (draftState: Draft<DiagramMakerWorkspace>, action: ZoomWorkspaceAction) => {
  const currentWorkspace = draftState;

  const { position } = action.payload;
  const workspaceSize = currentWorkspace.canvasSize;
  const containerSize = draftState.viewContainerSize;

  const newScale = getNewZoomLevel(currentWorkspace, action);

  const { x, y } = getNewZoomPosition(
    position,
    currentWorkspace.position,
    currentWorkspace.scale,
    newScale,
  );

  const newPosition = clampPosition({ x, y }, workspaceSize, newScale, containerSize);

  currentWorkspace.scale = newScale;
  currentWorkspace.position = newPosition;
};

const dragReducer = (draftState: Draft<DiagramMakerWorkspace>, action: DragWorkspaceAction) => {
  const currentWorkspace = draftState;
  currentWorkspace.position = getNewDragPosition(currentWorkspace, action);
};

const resizeReducer = (draftState: Draft<DiagramMakerWorkspace>, action: ResizeWorkspaceAction) => {
  const currentWorkspace = draftState;
  currentWorkspace.viewContainerSize = action.payload.containerSize;

  currentWorkspace.scale = clampZoom(
    currentWorkspace.scale,
    currentWorkspace.canvasSize,
    currentWorkspace.viewContainerSize,
  );

  currentWorkspace.position = clampPosition(
    currentWorkspace.position,
    currentWorkspace.canvasSize,
    currentWorkspace.scale,
    currentWorkspace.viewContainerSize,
  );
};

const canvasResizeReducer = (draftState: Draft<DiagramMakerWorkspace>, action: ResizeWorkspaceCanvasAction) => {
  const currentWorkspace = draftState;
  currentWorkspace.canvasSize = action.payload.canvasSize;
};

const focusReducer = (draftState: Draft<DiagramMakerWorkspace>, action: FocusNodeAction) => {
  draftState.scale = 1;
  const { position, size } = action.payload;
  const nodeCenter = {
    x: position.x + (size.width / 2),
    y: position.y + (size.height / 2),
  };
  const { canvasSize, viewContainerSize } = draftState;
  const leftOffset = action.payload.leftPanelWidth || 0;
  const rightOffset = action.payload.rightPanelWidth || 0;
  const updatedViewContainer: Size = {
    width: viewContainerSize.width - leftOffset - rightOffset,
    height: viewContainerSize.height,
  };
  const workspacePosition = {
    x: (updatedViewContainer.width / 2) - nodeCenter.x + leftOffset,
    y: (updatedViewContainer.height / 2) - nodeCenter.y,
  };
  draftState.position = clampPosition(workspacePosition, canvasSize, 1, updatedViewContainer);
};

const fitReducer = (draftState: Draft<DiagramMakerWorkspace>, action: FitAction) => {
  const { nodeRects } = action.payload;
  let minX = draftState.canvasSize.width;
  let minY = draftState.canvasSize.height;
  let maxX = 0;
  let maxY = 0;
  nodeRects.forEach((rect) => {
    minX = Math.min(minX, rect.position.x - FIT_BUFFER);
    minY = Math.min(minY, rect.position.y - FIT_BUFFER);
    maxX = Math.max(maxX, rect.position.x + rect.size.width + FIT_BUFFER);
    maxY = Math.max(maxY, rect.position.y + rect.size.height + FIT_BUFFER);
  });
  const { canvasSize, viewContainerSize } = draftState;
  const expectedWidth = maxX - minX;
  const expctedHeight = maxY - minY;
  const leftOffset = action.payload.leftPanelWidth || 0;
  const rightOffset = action.payload.rightPanelWidth || 0;
  const updatedViewContainer: Size = {
    width: viewContainerSize.width - leftOffset - rightOffset,
    height: viewContainerSize.height,
  };
  const scaleForWidth = updatedViewContainer.width / expectedWidth;
  const scaleForHeight = updatedViewContainer.height / expctedHeight;
  const expectedScale = Math.min(scaleForHeight, scaleForWidth);
  const scale = clampZoom(expectedScale, canvasSize, updatedViewContainer);
  const expectedPosition = { x: (-minX * scale) + leftOffset, y: -minY * scale };
  const position = clampPosition(expectedPosition, canvasSize, scale, updatedViewContainer);
  draftState.scale = scale;
  draftState.position = position;
};

const resetZoomReducer = (draftState: Draft<DiagramMakerWorkspace>) => {
  const { canvasSize, viewContainerSize } = draftState;
  const workspaceCenter = {
    x: canvasSize.width / 2,
    y: canvasSize.height / 2,
  };
  const viewContainerCenter = {
    x: viewContainerSize.width / 2,
    y: viewContainerSize.height / 2,
  };
  const position = {
    x: viewContainerCenter.x - workspaceCenter.x,
    y: viewContainerCenter.y - workspaceCenter.y,
  };
  draftState.scale = 1;
  draftState.position = clampPosition(position, canvasSize, 1, viewContainerSize);
};

export default function workspaceReducer<NodeType, EdgeType>(
  state: DiagramMakerWorkspace | undefined,
  action: DiagramMakerAction<NodeType, EdgeType>,
): DiagramMakerWorkspace {
  if (state === undefined) {
    return getDefaultWorkspaceState();
  }
  switch (action.type) {
    case WorkspaceActionsType.WORKSPACE_DRAG:
      return produce(state, (draftState) => {
        dragReducer(draftState, action);
      });
    case WorkspaceActionsType.WORKSPACE_ZOOM:
      return produce(state, (draftState) => {
        zoomReducer(draftState, action);
      });
    case WorkspaceActionsType.WORKSPACE_RESIZE:
      return produce(state, (draftState) => {
        resizeReducer(draftState, action);
      });
    case EditorActionsType.FOCUS_NODE:
      return produce(state, (draftState) => {
        focusReducer(draftState, action);
      });
    case EditorActionsType.FIT:
      return produce(state, (draftState) => {
        fitReducer(draftState, action);
      });
    case WorkspaceActionsType.WORKSPACE_RESET_ZOOM:
      return produce(state, (draftState) => {
        resetZoomReducer(draftState);
      });
    case NodeActionsType.NODE_DRAG:
      return produce(state, (draftState) => {
        const { canvasSize } = state;
        const workspacePos = state.position;
        const nodePos = action.payload.position;
        const nodeSize = action.payload.size;

        // Resize and move workspace when node is dragged outside right boundary
        if (nodePos.x + nodeSize.width > canvasSize.width) {
          const incrementWidth = nodePos.x + nodeSize.width - canvasSize.width;
          const newCanvasSize = {
            height: canvasSize.height,
            width: canvasSize.width + incrementWidth,
          };
          const newWokspacePos = {
            x: workspacePos.x - incrementWidth,
            y: workspacePos.y,
          };
          const resizeAction = createResizeWorkspaceCanvasAction(newCanvasSize);
          const dragAction = createDragWorkspaceAction(newWokspacePos);
          canvasResizeReducer(draftState, resizeAction);
          dragReducer(draftState, dragAction);
        }
        // Resize and move workspace when node is dragged outside bottom boundary
        if (nodePos.y + nodeSize.height > canvasSize.height) {
          const incrementHeight = nodePos.y + nodeSize.height - canvasSize.height;
          const newCanvasSize = {
            height: canvasSize.height + incrementHeight,
            width: canvasSize.width,
          };
          const newWokspacePos = {
            x: workspacePos.x,
            y: workspacePos.y - incrementHeight,
          };
          const resizeAction = createResizeWorkspaceCanvasAction(newCanvasSize);
          const dragAction = createDragWorkspaceAction(newWokspacePos);
          canvasResizeReducer(draftState, resizeAction);
          dragReducer(draftState, dragAction);
        }
        // Resize workspace when node is dragged outside top boundary
        if (nodePos.y < 0) {
          const incrementHeight = -nodePos.y;
          const newCanvasSize = {
            height: canvasSize.height + incrementHeight,
            width: canvasSize.width,
          };
          const resizeAction = createResizeWorkspaceCanvasAction(newCanvasSize);
          canvasResizeReducer(draftState, resizeAction);
        }
        // Resize workspace when node is dragged outside left boundary
        if (nodePos.x < 0) {
          const incrementWidth = -nodePos.x;
          const newCanvasSize = {
            height: canvasSize.height,
            width: canvasSize.width + incrementWidth,
          };
          const resizeAction = createResizeWorkspaceCanvasAction(newCanvasSize);
          canvasResizeReducer(draftState, resizeAction);
        }
      });
    default:
      return state;
  }
}
