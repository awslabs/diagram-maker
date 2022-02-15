import { produce } from 'immer';

import { constrainRectangleWithinRectangle } from 'diagramMaker/service/positionUtils';
import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { DiagramMakerPotentialNode } from 'diagramMaker/state/types';

import { MARGIN_PX } from './nodeActionDispatcher';
import { NodeActionsType } from './nodeActions';

export default function potentialNodeReducer<NodeType, EdgeType>(
  state: DiagramMakerPotentialNode | null | undefined,
  action: DiagramMakerAction<NodeType, EdgeType>,
): DiagramMakerPotentialNode | null {
  if (state === undefined) {
    return null;
  }
  switch (action.type) {
    case (NodeActionsType.POTENTIAL_NODE_DRAG_START):
      return {
        position: action.payload.position,
        size: action.payload.size,
        typeId: action.payload.typeId,
      };
    case (NodeActionsType.POTENTIAL_NODE_DRAG):
      return produce(state, (draftState) => {
        if (draftState) {
          const { position, workspaceRectangle } = action.payload;
          const { size } = draftState;
          draftState.position = constrainRectangleWithinRectangle({ position, size }, workspaceRectangle, MARGIN_PX);
        }
      });
    case (NodeActionsType.POTENTIAL_NODE_DRAG_END):
      return null;
    default:
      return state;
  }
}
