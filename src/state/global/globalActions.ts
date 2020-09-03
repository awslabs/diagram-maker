import { Action } from 'redux';

import { DiagramMakerEdge, DiagramMakerNode } from 'diagramMaker/state/types';

export enum GlobalActionsType {
  /** Delete several items including nodes, edges together */
  DELETE_ITEMS = 'DELETE_ITEMS',
  /** Create several items including nodes, edges together */
  CREATE_ITEMS = 'CREATE_ITEMS'
}

export const GlobalActions = {
  ...GlobalActionsType
};

/** Action fired to delete items */
export interface DeleteItemsAction extends Action {
  type: GlobalActionsType.DELETE_ITEMS;
  payload: {
    /** IDs of nodes to delete */
    nodeIds: string[];
    /** IDs of edges to delete */
    edgeIds: string[];
  };
}

/** Action fired to create items */
export interface CreateItemsAction<NodeType, EdgeType> extends Action {
  type: GlobalActionsType.CREATE_ITEMS;
  payload: {
    /** Node objects with all node info to create */
    nodes: DiagramMakerNode<NodeType>[];
    /** Edge objects with all edge info to create */
    edges: DiagramMakerEdge<EdgeType>[];
  };
}

export type GlobalAction<NodeType, EdgeType> = DeleteItemsAction | CreateItemsAction<NodeType, EdgeType>;
