import { Action } from 'redux';

import { Position, Size } from 'diagramMaker/state/types';

export enum WorkspaceActionsType {
  /** Deselect all selected items */
  WORKSPACE_DESELECT = 'WORKSPACE_DESELECT',
  /** Select all items in the workspace */
  WORKSPACE_SELECT_ALL = 'WORKSPACE_SELECT_ALL',
  /** Move the workspace */
  WORKSPACE_DRAG = 'WORKSPACE_DRAG',
  /** Zoom the workspacce */
  WORKSPACE_ZOOM = 'WORKSPACE_ZOOM',
  /** Resize the container */
  WORKSPACE_RESIZE = 'WORKSPACE_RESIZE',
  /** Resize the workspace canvas */
  WORKSPACE_CANVAS_RESIZE = 'WORKSPACE_CANVAS_RESIZE',
  /** Resets the zoom */
  WORKSPACE_RESET_ZOOM = 'WORKSPACE_RESET_ZOOM',
}

export const WorkspaceActions = {
  ...WorkspaceActionsType,
};

/** Action fired to deselect all items */
export interface DeselectAction extends Action {
  type: WorkspaceActionsType.WORKSPACE_DESELECT;
}

/** Action fired to select all items */
export interface SelectAllAction extends Action {
  type: WorkspaceActionsType.WORKSPACE_SELECT_ALL;
}

/** Action fired to move the worksapce around */
export interface DragWorkspaceAction extends Action {
  type: WorkspaceActionsType.WORKSPACE_DRAG;
  payload: {
    /** Updated position for the workspace */
    position: Position;
  };
}

/** Action fired to zoom the workspace */
export interface ZoomWorkspaceAction extends Action {
  type: WorkspaceActionsType.WORKSPACE_ZOOM;
  payload: {
    /**
     * Incremental zoom to change the workspace scale by.
     * Positive means zooming in. Negative means zooming out.
     */
    zoom: number;
    /**
     * The zoom origin. Usually the cursor position.
     */
    position: Position;
  };
}

/** Action fired to resize the container */
export interface ResizeWorkspaceAction extends Action {
  type: WorkspaceActionsType.WORKSPACE_RESIZE;
  payload: {
    /** New container size that the workspace is rendering in. */
    containerSize: Size;
  };
}

/** Action fired to resize the workspace canvas */
export interface ResizeWorkspaceCanvasAction extends Action {
  type: WorkspaceActionsType.WORKSPACE_CANVAS_RESIZE;
  payload: {
    /** New canvas size of the workspace */
    canvasSize: Size;
  };
}

/** Action fired to reset the zoom level for the workspace */
export interface WorkspaceResetZoomAction extends Action {
  type: WorkspaceActionsType.WORKSPACE_RESET_ZOOM;
}

export type WorkspaceAction = DeselectAction | DragWorkspaceAction | ResizeWorkspaceCanvasAction |
ResizeWorkspaceAction | SelectAllAction | ZoomWorkspaceAction | WorkspaceResetZoomAction;
