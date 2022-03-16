import { Action } from 'redux';

import { Position } from 'diagramMaker/state/types';

export enum EdgeActionsType {
  /** Edge creation */
  EDGE_CREATE = 'EDGE_CREATE',
  /** Edge deletion */
  EDGE_DELETE = 'EDGE_DELETE',
  /** Edge selection */
  EDGE_SELECT = 'EDGE_SELECT',
  /** Potential Edge drag start */
  EDGE_DRAG_START = 'EDGE_DRAG_START',
  /** Potential Edge drag */
  EDGE_DRAG_END = 'EDGE_DRAG_END',
  /** Potential Edge drag end */
  EDGE_DRAG = 'EDGE_DRAG',
  /** Mouse enters edge */
  EDGE_MOUSE_OVER = 'EDGE_MOUSE_OVER',
  /** Mouse leaves edge */
  EDGE_MOUSE_OUT = 'EDGE_MOUSE_OUT',
}

export const EdgeActions = {
  ...EdgeActionsType,
};

/** Action fired to select an edge */
export interface SelectEdgeAction extends Action {
  type: EdgeActionsType.EDGE_SELECT;
  payload: {
    /** ID of the edge that needs to be selected */
    id: string;
  };
}

/** Action fired to delete an edge */
export interface DeleteEdgeAction extends Action {
  type: EdgeActionsType.EDGE_DELETE;
  payload: {
    /** ID of the edge that needs to be deleted */
    id: string;
  };
}

/** Action fired to create an edge */
export interface CreateEdgeAction<EdgeType> extends Action {
  type: EdgeActionsType.EDGE_CREATE;
  payload: {
    /** ID of the new edge that needs to be created. Needs to be unique. */
    id: string;
    /** ID of the node from where this edge originates */
    src: string;
    /** ID of the node where this edge terminates */
    dest: string;
    /** Consumer data that needs to be added for this newly created edge. */
    consumerData?: EdgeType;
    /** Type of the connector where this edge originates.
     *  Only applicable if the source node is of a node type that has custom connecter placements.
     */
    connectorSrcType?: string;
    /** Type of the connector where this edge ends.
     *  Only applicable if the destination node is of a node type that has custom connecter placements.
     */
    connectorDestType?: string;
  };
}

/** Action fired to start dragging a potential edge */
export interface DragStartEdgeAction extends Action {
  type: EdgeActionsType.EDGE_DRAG_START;
  payload: {
    /** ID of the node from where this potential edge originates */
    id: string;
    /** Position where this potential edge terminates. Usually the cursor position. */
    position: Position;
    /** Type of the connector where this potential edge originates.
     *  Only applicable for node types that have custom connecter placements.
     */
    connectorSrcType?: string;
  };
}

/** Action fired to end dragging a potential edge */
export interface DragEndEdgeAction extends Action {
  type: EdgeActionsType.EDGE_DRAG_END;
}

/** Action fired to update the termination position for a potential edge */
export interface DragEdgeAction extends Action {
  type: EdgeActionsType.EDGE_DRAG;
  payload: {
    /** Updated position where this potential edge should terminate. Usually the cursor position. */
    position: Position;
  };
}

/** Action fired when the mouse enters an edge */
export interface MouseOverAction extends Action {
  type: EdgeActionsType.EDGE_MOUSE_OVER;
  payload: {
    /** ID of the edge that is being hovered */
    id: string;
  };
}

/** Action fired when the mouse leaves an edge */
export interface MouseOutAction extends Action {
  type: EdgeActionsType.EDGE_MOUSE_OUT;
  payload: {
    /** ID of the edge that is being hovered */
    id: string;
  };
}

export type EdgeAction<EdgeType> = CreateEdgeAction<EdgeType> | SelectEdgeAction | DeleteEdgeAction |
DragStartEdgeAction | DragEndEdgeAction | DragEdgeAction | MouseOverAction | MouseOutAction;
