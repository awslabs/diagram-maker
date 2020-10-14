import { produce } from 'immer';

import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { DiagramMakerEditor, EditorMode } from 'diagramMaker/state/types';

import { EditorActionsType } from './editorActions';

export default function editorReducer<NodeType, EdgeType>(
  state: DiagramMakerEditor | undefined, action: DiagramMakerAction<NodeType, EdgeType>
): DiagramMakerEditor {
  if (state === undefined) {
    return {
      mode: EditorMode.DRAG
    };
  }
  switch (action.type) {
    case EditorActionsType.SET_EDITOR_MODE:
      return produce(state, (draftState) => {
        draftState.mode = action.payload.mode;
      });
    case EditorActionsType.SHOW_CONTEXT_MENU:
      return produce(state, (draftState) => {
        draftState.contextMenu = {
          position: action.payload.position,
          targetId: action.payload.targetId,
          targetType: action.payload.targetType
        };
      });
    case EditorActionsType.HIDE_CONTEXT_MENU:
      return produce(state, (draftState) => {
        draftState.contextMenu = undefined;
      });
    case EditorActionsType.SHOW_SELECTION_MARQUEE:
      return produce(state, (draftState) => {
        draftState.selectionMarquee = {
          anchor: action.payload.anchor,
          position: action.payload.anchor
        };
      });
    case EditorActionsType.UPDATE_SELECTION_MARQUEE:
      return produce(state, (draftState) => {
        const anchor = state.selectionMarquee && state.selectionMarquee.anchor || action.payload.position;
        draftState.selectionMarquee = {
          anchor,
          position: action.payload.position
        };
      });
    case EditorActionsType.HIDE_SELECTION_MARQUEE:
      return produce(state, (draftState) => {
        draftState.selectionMarquee = undefined;
      });
    default:
      return state;
  }
}
