import { EditorMode } from 'diagramMaker/state/types';
import { asMock } from 'diagramMaker/testing/testUtils';

import {
  createFitAction,
  createFocusNodeAction,
  createSetEditorModeAction,
  handleHideContextMenu,
  handleHideSelectionMarquee,
  handleShowContextMenu,
  handleShowSelectionMarquee,
  handleUpdateSelectionMarquee
} from './editorActionDispatcher';
import { EditorActionsType } from './editorActions';

describe('editorActionDispatcher', () => {

  const store: any = {
    dispatch: jest.fn(),
    getState: jest.fn()
  };

  const mockConfig: any = {
    getBoundRenderContextMenu: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockState(mockedState: any) {
    asMock(store.getState).mockReturnValueOnce(mockedState);
  }

  describe('handleHideContextMenu', () => {
    it('dispatches nothing if editor state is not defined', () => {
      mockState({});
      handleHideContextMenu(store);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing if context menu state is not defined', () => {
      mockState({ editor: {} });
      handleHideContextMenu(store);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches hide context menu action if context menu state is defined', () => {
      mockState({ editor: { contextMenu: {} } });
      handleHideContextMenu(store);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: EditorActionsType.HIDE_CONTEXT_MENU
      });
      expect(store.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleShowContextMenu', () => {
    it('dispatches nothing if type is not present on target', () => {
      const event: any = { target: {} };
      handleShowContextMenu(store, mockConfig, event);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing if context menu state is not defined', () => {
      const type = 'testType';
      const id = 'testId';
      const event: any = { target: { type, id } };
      handleShowContextMenu(store, mockConfig, event);
      expect(store.dispatch).not.toHaveBeenCalled();
      expect(mockConfig.getBoundRenderContextMenu).toHaveBeenCalledWith(type, id);
    });

    it('dispatches show context menu action if type & render callback are defined', () => {
      const type = 'testType';
      const id = 'testId';
      const originalEvent = { preventDefault: jest.fn() };
      const position = { x: 29, y: 32 };
      const event: any = { originalEvent, position, target: { type, id } };
      asMock(mockConfig.getBoundRenderContextMenu).mockReturnValueOnce(jest.fn());
      handleShowContextMenu(store, mockConfig, event);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position, targetId: id, targetType: type },
        type: EditorActionsType.SHOW_CONTEXT_MENU
      });
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(event.originalEvent.preventDefault).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleShowSelectionMarquee', () => {
    it('dispatches show selection marquee action with anchor point', () => {
      const anchor = { x: 10, y: 10 };
      handleShowSelectionMarquee(store, anchor);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { anchor },
        type: EditorActionsType.SHOW_SELECTION_MARQUEE
      });
    });
  });

  describe('handleUpdateSelectionMarquee', () => {
    it('does not dispatch update selection marquee action when selection marquee is not defined', () => {
      mockState({ editor: {} });
      const position = { x: 20, y: 20 };
      handleUpdateSelectionMarquee(store, position);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches update selection marquee action with position bottom right of anchor', () => {
      const anchor = { x: 10, y: 10 };
      const position = { x: 20, y: 20 };
      mockState({ editor: { selectionMarquee: { anchor, position: anchor } } });
      handleUpdateSelectionMarquee(store, position);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: {
          anchor,
          position
        },
        type: EditorActionsType.UPDATE_SELECTION_MARQUEE
      });
    });

    it('dispatches update selection marquee action with position top left of anchor', () => {
      const anchor = { x: 20, y: 20 };
      const position = { x: 10, y: 10 };
      mockState({ editor: { selectionMarquee: { anchor, position: anchor } } });
      handleUpdateSelectionMarquee(store, position);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: {
          anchor,
          position
        },
        type: EditorActionsType.UPDATE_SELECTION_MARQUEE
      });
    });
  });

  describe('handleHideSelectionMarquee', () => {
    it('does not dispatch hide selection marquee action when selection marquee is not defined', () => {
      mockState({ editor: {} });
      handleHideSelectionMarquee(store);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches hide selection marquee action when selection marquee is defined', () => {
      mockState({ editor: { selectionMarquee: {} } });
      handleHideSelectionMarquee(store);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: EditorActionsType.HIDE_SELECTION_MARQUEE
      });
    });
  });

  describe('createFocusNodeAction', () => {
    it('returns focus node action', () => {
      const id = 'testId';
      const position = { x: 10, y: 10 };
      const size = { width: 10, height: 10 };
      expect(createFocusNodeAction(id, position, size)).toEqual({
        payload: {
          id,
          position,
          size
        },
        type: EditorActionsType.FOCUS_NODE
      });
    });

    it('returns focus node action with left panel & right panel widths', () => {
      const id = 'testId';
      const position = { x: 10, y: 10 };
      const size = { width: 10, height: 10 };
      const leftPanelWidth = 100;
      const rightPanelWidth = 100;
      expect(createFocusNodeAction(id, position, size, leftPanelWidth, rightPanelWidth)).toEqual({
        payload: {
          id,
          leftPanelWidth,
          position,
          rightPanelWidth,
          size
        },
        type: EditorActionsType.FOCUS_NODE
      });
    });
  });

  describe('createFitAction', () => {
    it('returns fit action', () => {
      const nodeRect1 = { position: { x: 10, y: 10 }, size: { width: 10, height: 10 } };
      const nodeRect2 = { position: { x: 20, y: 20 }, size: { width: 20, height: 20 } };
      const nodeRects = [nodeRect1, nodeRect2];
      expect(createFitAction(nodeRects)).toEqual({
        payload: {
          nodeRects
        },
        type: EditorActionsType.FIT
      });
    });

    it('returns fit action with left panel & right panel widths', () => {
      const nodeRect1 = { position: { x: 10, y: 10 }, size: { width: 10, height: 10 } };
      const nodeRect2 = { position: { x: 20, y: 20 }, size: { width: 20, height: 20 } };
      const nodeRects = [nodeRect1, nodeRect2];
      const leftPanelWidth = 100;
      const rightPanelWidth = 100;
      expect(createFitAction(nodeRects, leftPanelWidth, rightPanelWidth)).toEqual({
        payload: {
          leftPanelWidth,
          nodeRects,
          rightPanelWidth
        },
        type: EditorActionsType.FIT
      });
    });
  });

  describe('createSetEditorModeAction', () => {
    it('returns set editor mode action', () => {
      const mode = EditorMode.READ_ONLY;
      expect(createSetEditorModeAction(mode)).toEqual({
        payload: {
          mode
        },
        type: EditorActionsType.SET_EDITOR_MODE
      });
    });
  });
});
