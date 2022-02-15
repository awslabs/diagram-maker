import { Action } from 'redux';

import { Position, Size } from 'diagramMaker/state/types';

export enum PanelActionsType {
  /** Start dragging a panel */
  PANEL_DRAG_START = 'PANEL_DRAG_START',
  /** Drag a panel */
  PANEL_DRAG = 'PANEL_DRAG',
  /** Resize a panel */
  PANEL_RESIZE = 'PANEL_RESIZE',
}

export const PanelActions = {
  ...PanelActionsType,
};

/** Action fired to resize a panel */
export interface ResizePanelAction extends Action {
  type: PanelActionsType.PANEL_RESIZE;
  payload: {
    /** ID of the panel to resize */
    id: string;
    /** Updated size of the panel */
    size: Size;
  };
}

/** Action fired to drag a panel */
export interface DragPanelAction extends Action {
  type: PanelActionsType.PANEL_DRAG;
  payload: {
    /** ID of the panel to drag */
    id: string;
    /** Updated position of the panel */
    position: Position;
    /** Size of diagram maker container */
    viewContainerSize: Size;
  };
}

/** Action fired on initial drag of panel */
export interface DragStartPanelAction extends Action {
  type: PanelActionsType.PANEL_DRAG_START;
  payload: {
    /** ID of the panel to drag */
    id: string;
  };
}

export type PanelAction = ResizePanelAction | DragPanelAction | DragStartPanelAction;
