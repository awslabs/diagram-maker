import set from 'lodash-es/set';

import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  DiagramMakerEditor, EditorMode, EditorModeType, Position,
} from 'diagramMaker/state/types';

import {
  EditorActionsType,
  HideContextMenuAction,
  HideSelectionMarqueeAction,
  SetEditorModeAction,
  ShowContextMenuAction,
  ShowSelectionMarqueeAction,
  UpdateSelectionMarqueeAction,
} from './editorActions';
import editorReducer from './editorReducer';

describe('editorReducer', () => {
  const getState = (): DiagramMakerEditor => ({
    contextMenu: {
      position: { x: 0, y: 0 },
      targetId: 'node-1',
      targetType: DiagramMakerComponentsType.NODE,
    },
    mode: EditorMode.DRAG,
  });

  const getStateWithMarquee = (): DiagramMakerEditor => ({
    mode: EditorMode.SELECT,
    selectionMarquee: {
      anchor: { x: 10, y: 10 },
      position: { x: 10, y: 10 },
    },
  });

  const defaultState = {
    mode: EditorMode.DRAG,
  };

  function checkReducerPurity(state: DiagramMakerEditor, expectedState: DiagramMakerEditor) {
    expect(state).toEqual(expectedState);
  }

  describe('init', () => {
    it('returns default state if previous state is undefined', () => {
      const action: any = { type: 'randomAction' };
      expect(editorReducer(undefined, action)).toEqual(defaultState);
    });
  });

  describe('unknown action', () => {
    it('returns old state', () => {
      const state = getState();
      const action: any = { type: 'randomAction' };
      expect(editorReducer(state, action)).toBe(state);
      checkReducerPurity(state, getState());
    });
  });

  describe('show context menu action', () => {
    it('sets the context menu with position, target type & id from action payload', () => {
      const targetId = 'node-2';
      const targetType = DiagramMakerComponentsType.NODE;
      const position = { x: 17, y: 17 };
      const action: ShowContextMenuAction = {
        type: EditorActionsType.SHOW_CONTEXT_MENU,
        payload: { position, targetType, targetId },
      };
      const expectedState = getState();
      set(expectedState, 'contextMenu', action.payload);
      expect(editorReducer(getState(), action)).toEqual(expectedState);
    });
  });

  describe('hide context menu action', () => {
    it('hides the context menu', () => {
      const state = getState();
      const action: HideContextMenuAction = { type: EditorActionsType.HIDE_CONTEXT_MENU };
      const expectedState = getState();
      set(expectedState, 'contextMenu', undefined);
      expect(editorReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState());
    });
  });

  describe('set editor mode action', () => {
    it('sets editor to selection mode when mode change event fires', () => {
      const state = getState();
      const mode: EditorModeType = EditorMode.SELECT;
      const action: SetEditorModeAction = {
        type: EditorActionsType.SET_EDITOR_MODE,
        payload: { mode },
      };

      const expectedState = getState();
      set(expectedState, 'mode', mode);

      expect(editorReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState());
    });
  });

  describe('show selection marquee action', () => {
    it('creates selection marquee at the given anchor point', () => {
      const state = getState();
      const anchor: Position = { x: 10, y: 10 };
      const action: ShowSelectionMarqueeAction = {
        type: EditorActionsType.SHOW_SELECTION_MARQUEE,
        payload: { anchor },
      };

      const expectedState = getState();
      set(expectedState, 'selectionMarquee', { anchor, position: anchor });

      expect(editorReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState());
    });
  });

  describe('update selection marquee action', () => {
    it('updates selection marquee with the given position and size', () => {
      const state = getStateWithMarquee();
      const anchor = state.selectionMarquee ? state.selectionMarquee.anchor : { x: 0, y: 0 };
      const position: Position = { x: 5, y: 5 };
      const action: UpdateSelectionMarqueeAction = {
        type: EditorActionsType.UPDATE_SELECTION_MARQUEE,
        payload: { anchor, position },
      };

      const expectedState = getStateWithMarquee();
      const expectedAnchor = expectedState.selectionMarquee && expectedState.selectionMarquee.anchor;
      set(expectedState, 'selectionMarquee', { position, anchor: expectedAnchor });

      expect(editorReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getStateWithMarquee());
    });
  });

  describe('hide selection marquee action', () => {
    it('hides the selection marquee', () => {
      const state = getStateWithMarquee();
      const action: HideSelectionMarqueeAction = {
        type: EditorActionsType.HIDE_SELECTION_MARQUEE,
      };

      const expectedState = getStateWithMarquee();
      set(expectedState, 'selectionMarquee', undefined);

      expect(editorReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getStateWithMarquee());
    });
  });
});
