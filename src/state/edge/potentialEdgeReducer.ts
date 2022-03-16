import { produce } from 'immer';

import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { DiagramMakerPotentialEdge } from 'diagramMaker/state/types';

import { EdgeActionsType } from './edgeActions';

export default function potentialEdgeReducer<NodeType, EdgeType>(
  state: DiagramMakerPotentialEdge | null | undefined,
  action: DiagramMakerAction<NodeType, EdgeType>,
): DiagramMakerPotentialEdge | null {
  if (state === undefined) {
    return null;
  }
  switch (action.type) {
    case (EdgeActionsType.EDGE_DRAG_START):
      return {
        position: action.payload.position,
        src: action.payload.id,
        connectorSrcType: action.payload.connectorSrcType,
      };
    case (EdgeActionsType.EDGE_DRAG):
      return produce(state, (draftState) => {
        if (draftState) {
          draftState.position = action.payload.position;
        }
      });
    case (EdgeActionsType.EDGE_DRAG_END):
      return null;
    default:
      return state;
  }
}
