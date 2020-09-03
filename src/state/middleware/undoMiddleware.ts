import filter from 'lodash-es/filter';
import { createUndoMiddleware } from 'redux-undo-redo';

import { CreateEdgeAction, EdgeActions } from 'diagramMaker/state/edge/edgeActions';
import { createDeleteItemsAction, createNewItemsAction } from 'diagramMaker/state/global/globalActionDispatcher';
import { DeleteItemsAction, GlobalActions } from 'diagramMaker/state/global/globalActions';
import { CreateNodeAction, NodeActions } from 'diagramMaker/state/node/nodeActions';
import { DiagramMakerData, DiagramMakerEdge, DiagramMakerNode } from 'diagramMaker/state/types';

export const getUndoMiddleware = <NodeType, EdgeType>() => {
  return createUndoMiddleware<DiagramMakerData<NodeType, EdgeType>>({
    revertingActions: {
      [EdgeActions.EDGE_CREATE]: (action: CreateEdgeAction<EdgeType>) =>
          createDeleteItemsAction([], [action.payload.id]),
      [NodeActions.NODE_CREATE]: (action: CreateNodeAction<NodeType>) =>
          createDeleteItemsAction([action.payload.id], []),
      [GlobalActions.DELETE_ITEMS]: {
        action: (action: DeleteItemsAction, args: any) =>
          createNewItemsAction(args.nodes, args.edges),
        createArgs: (state: DiagramMakerData<NodeType, EdgeType>, action: DeleteItemsAction) => ({
          edges: filter(state.edges, (edge: DiagramMakerEdge<EdgeType>) =>
            action.payload.edgeIds.indexOf(edge.id) > -1),
          nodes: filter(state.nodes, (node: DiagramMakerNode<NodeType>) => action.payload.nodeIds.indexOf(node.id) > -1)
        })
      }
    }
  });
};
