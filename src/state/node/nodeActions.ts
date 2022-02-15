import { Action } from 'redux';

import { Position, Rectangle, Size } from 'diagramMaker/state/types';

export enum NodeActionsType {
  NODE_CREATE = 'NODE_CREATE',
  NODE_DELETE = 'NODE_DELETE',
  NODE_SELECT = 'NODE_SELECT',
  NODE_DRAG_START = 'NODE_DRAG_START',
  NODE_DRAG_END = 'NODE_DRAG_END',
  NODE_DRAG = 'NODE_DRAG',
  NODE_LAYOUT = 'NODE_LAYOUT',
  POTENTIAL_NODE_DRAG_START = 'POTENTIAL_NODE_DRAG_START',
  POTENTIAL_NODE_DRAG = 'POTENTIAL_NODE_DRAG',
  POTENTIAL_NODE_DRAG_END = 'POTENTIAL_NODE_DRAG_END',
}

export const NodeActions = {
  ...NodeActionsType,
};

/** Action fired to create a new node */
export interface CreateNodeAction<NodeType> extends Action {
  type: NodeActionsType.NODE_CREATE;
  payload: {
    /** ID for the new node that needs to be created. Needs to be unique. */
    id: string,
    /** type ID of the new node. Picked up from the potential node that was used to create this node. */
    typeId: string,
    /** Position where the new node will be created. */
    position: Position,
    /** Size of the new node */
    size: Size,
    /** Consumer data that needs to be added for the newly created node. */
    consumerData?: NodeType
  };
}

/** Action fired when a new potential node starts being dragged */
export interface DragStartPotentialNodeAction extends Action {
  type: NodeActionsType.POTENTIAL_NODE_DRAG_START;
  payload: {
    /**
     * type ID of the new node that will be created if this is dropped on the workspace.
     * Picked up from the potential node that was used to create this potential node.
     */
    typeId: string,
    /** Current position of the potential node */
    position: Position,
    /** Size for the node that will be created if this is dropped on the workspace. */
    size: Size
  };
}

/** Action fired to update the position for a potential node */
export interface DragPotentialNodeAction extends Action {
  type: NodeActionsType.POTENTIAL_NODE_DRAG;
  payload: {
    /** Updated position for the potential node */
    position: Position,

    /** A Rectangle representing the workspace */
    workspaceRectangle: Rectangle
  };
}

/** Action fired to end dragging the potential node */
export interface DragEndPotentialNodeAction extends Action {
  type: NodeActionsType.POTENTIAL_NODE_DRAG_END;
}

/** Action fired to select a node */
export interface SelectNodeAction extends Action {
  type: NodeActionsType.NODE_SELECT;
  payload: {
    /** ID of the node to select */
    id: string;
  };
}

/**
 * Action fired to delete a node.
 * Please note that this doesn't delete the connected edges
 * and may lead to edges that remain in state but are not rendered.
 */
export interface DeleteNodeAction extends Action {
  type: NodeActionsType.NODE_DELETE;
  payload: {
    /** ID of the node to delete */
    id: string;
  };
}

/** Action fired to start dragging a node */
export interface DragStartNodeAction extends Action {
  type: NodeActionsType.NODE_DRAG_START;
  payload: {
    /** ID of the node to start dragging for */
    id: string;
  };
}

/** Action fired to end dragging a node */
export interface DragEndNodeAction extends Action {
  type: NodeActionsType.NODE_DRAG_END;
  payload: {
    /** ID of the node to end dragging for */
    id: string;
  };
}

/** Action fired to update the position for the node */
export interface DragNodeAction extends Action {
  type: NodeActionsType.NODE_DRAG;
  payload: {
    /** ID of the node to update position for */
    id: string;
    /** Updated position for the node */
    position: Position;
    workspaceRectangle: Rectangle;
    size: Size;
  };
}

export type NodeAction<NodeType> =
  SelectNodeAction | DeleteNodeAction | DragStartNodeAction | DragEndNodeAction | DragNodeAction |
  DragPotentialNodeAction | DragStartPotentialNodeAction | DragEndPotentialNodeAction | CreateNodeAction<NodeType>;
