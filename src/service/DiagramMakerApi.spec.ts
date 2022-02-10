import { Store } from 'redux';
import { actions as undoActions } from 'redux-undo-redo';

import {
  createFitAction, createFocusNodeAction, createSetEditorModeAction,
} from 'diagramMaker/state/editor/editorActionDispatcher';
import {
  createLayoutAction, HierarchicalLayoutConfig, LayoutType,
} from 'diagramMaker/state/layout';
import { DiagramMakerData, EditorMode, EditorModeType } from 'diagramMaker/state/types';
import {
  createWorkspaceResetZoomAction, createZoomWorkspaceAction,
} from 'diagramMaker/state/workspace/workspaceActionDispatcher';
import { asMock } from 'diagramMaker/testing/testUtils';

import DiagramMakerApi from './DiagramMakerApi';

jest.mock('redux-undo-redo', () => ({
  actions: {
    redo: jest.fn(),
    undo: jest.fn(),
  },
}));

jest.mock('diagramMaker/state/layout/layoutActionDispatcher', () => ({
  createLayoutAction: jest.fn(),
}));

jest.mock('diagramMaker/state/workspace/workspaceActionDispatcher', () => ({
  createWorkspaceResetZoomAction: jest.fn(),
  createZoomWorkspaceAction: jest.fn(),
}));

jest.mock('diagramMaker/state/editor/editorActionDispatcher', () => ({
  createFitAction: jest.fn(), createFocusNodeAction: jest.fn(), createSetEditorModeAction: jest.fn(),
}));

describe('DiagramMakerApi', () => {
  function mockStore(): Store<DiagramMakerData<{}, {}>> {
    return {
      dispatch: jest.fn(),
      getState: jest.fn(),
    } as any;
  }

  beforeEach(() => jest.clearAllMocks());

  describe('layout', () => {
    it('dispatches layout action and returns itself', () => {
      const store = mockStore();
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      const layoutConfig: HierarchicalLayoutConfig = {
        layoutType: LayoutType.HIERARCHICAL,
        fixedNodeIds: ['node-1'],
        distanceMin: 30,
      };
      asMock(createLayoutAction).mockImplementationOnce(() => action);

      const result = api.layout(layoutConfig);
      expect(result).toBe(api);
      expect(createLayoutAction).toHaveBeenCalledTimes(1);
      expect(createLayoutAction).toHaveBeenCalledWith(layoutConfig);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe('setEditorMode', () => {
    it('dispatches set editor mode action and returns itself', () => {
      const store = mockStore();
      const api = new DiagramMakerApi(store);
      const mode: EditorModeType = EditorMode.SELECT;
      const action = { type: 'MOCK_ACTION' };

      asMock(createSetEditorModeAction).mockImplementationOnce(() => action);

      const result = api.setEditorMode(mode);
      expect(result).toBe(api);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
      expect(createSetEditorModeAction).toHaveBeenCalledTimes(1);
      expect(createSetEditorModeAction).toHaveBeenCalledWith(mode);
    });
  });

  describe('focus node', () => {
    it('dispatches focus node action and returns itself', () => {
      const testId = 'node-1';
      const position = { x: 10, y: 10 };
      const size = { width: 10, height: 10 };
      const store = mockStore();
      const mockState = {
        nodes: {
          [testId]: {
            diagramMakerData: {
              position,
              size,
            },
          },
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createFocusNodeAction).mockReturnValueOnce(action);

      const result = api.focusNode(testId);
      expect(result).toBe(api);
      expect(createFocusNodeAction).toHaveBeenCalledTimes(1);
      expect(createFocusNodeAction).toHaveBeenCalledWith(testId, position, size, undefined, undefined);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('dispatches focus node action with panel widths and returns itself', () => {
      const testId = 'node-1';
      const position = { x: 10, y: 10 };
      const size = { width: 10, height: 10 };
      const store = mockStore();
      const mockState = {
        nodes: {
          [testId]: {
            diagramMakerData: {
              position,
              size,
            },
          },
        },
      };
      const leftPanelWidth = 100;
      const rightPanelWidth = 100;
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createFocusNodeAction).mockReturnValueOnce(action);

      const result = api.focusNode(testId, leftPanelWidth, rightPanelWidth);
      expect(result).toBe(api);
      expect(createFocusNodeAction).toHaveBeenCalledTimes(1);
      expect(createFocusNodeAction).toHaveBeenCalledWith(testId, position, size, leftPanelWidth, rightPanelWidth);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('dispatches nothing if node doesnt exist and returns itself', () => {
      const testId = 'node-1';
      const store = mockStore();
      const mockState = { nodes: {} };
      const api = new DiagramMakerApi(store);
      asMock(store.getState).mockReturnValueOnce(mockState);

      const result = api.focusNode(testId);
      expect(result).toBe(api);
      expect(createFocusNodeAction).not.toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('focus selected', () => {
    it('dispatches reset zoom if no nodes are selected and returns itself', () => {
      const store = mockStore();
      const mockState = {
        nodes: {
          'node-1': { diagramMakerData: {} },
          'node-2': { diagramMakerData: {} },
        },
      };
      const api = new DiagramMakerApi(store);
      const resetZoomSpy = jest.spyOn(api, 'resetZoom');
      asMock(store.getState).mockReturnValue(mockState);

      const result = api.focusSelected();
      expect(result).toBe(api);
      expect(resetZoomSpy).toHaveBeenCalledTimes(1);
    });

    it('dispatches focus node if a single node is selected and returns itself', () => {
      const store = mockStore();
      const mockState = {
        nodes: {
          'node-1': { diagramMakerData: { selected: true } },
          'node-2': { diagramMakerData: {} },
        },
      };
      const api = new DiagramMakerApi(store);
      const focusNodeSpy = jest.spyOn(api, 'focusNode');
      asMock(store.getState).mockReturnValue(mockState);

      const result = api.focusSelected();
      expect(result).toBe(api);
      expect(focusNodeSpy).toHaveBeenCalledTimes(1);
      expect(focusNodeSpy).toHaveBeenCalledWith('node-1');
    });

    it('dispatches fit with selected nodes if a multiple nodes are selected and returns itself', () => {
      const store = mockStore();
      const mockState = {
        nodes: {
          'node-1': { diagramMakerData: { selected: true } },
          'node-2': { diagramMakerData: { selected: true } },
        },
      };
      const api = new DiagramMakerApi(store);
      const fitSpy = jest.spyOn(api, 'fit');
      asMock(store.getState).mockReturnValue(mockState);

      const result = api.focusSelected();
      expect(result).toBe(api);
      expect(fitSpy).toHaveBeenCalledTimes(1);
      expect(fitSpy).toHaveBeenCalledWith(undefined, undefined, ['node-1', 'node-2']);
    });

    it('dispatches fit with selected nodes & panel widths if a multiple nodes are selected and returns itself', () => {
      const store = mockStore();
      const mockState = {
        nodes: {
          'node-1': { diagramMakerData: { selected: true } },
          'node-2': { diagramMakerData: { selected: true } },
        },
      };
      const api = new DiagramMakerApi(store);
      const fitSpy = jest.spyOn(api, 'fit');
      const leftPanelWidth = 100;
      const rightPanelWidth = 100;
      asMock(store.getState).mockReturnValue(mockState);

      const result = api.focusSelected(leftPanelWidth, rightPanelWidth);
      expect(result).toBe(api);
      expect(fitSpy).toHaveBeenCalledTimes(1);
      expect(fitSpy).toHaveBeenCalledWith(leftPanelWidth, rightPanelWidth, ['node-1', 'node-2']);
    });
  });

  describe('fit', () => {
    it('dispatches fit action with nodeKeys and returns itself', () => {
      const store = mockStore();
      const mockState = {
        nodes: {
          'node-1': {
            diagramMakerData: {
              position: { x: 10, y: 10 },
              size: { width: 10, height: 10 },
            },
          },
          'node-2': {
            diagramMakerData: {
              position: { x: 20, y: 20 },
              size: { width: 20, height: 20 },
            },
          },
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createFitAction).mockReturnValueOnce(action);

      const nodeKeys = ['node-1'];
      const result = api.fit(undefined, undefined, nodeKeys);

      const expectedRects = nodeKeys.map((nodeKey) => ({
        position: (mockState.nodes as any)[nodeKey].diagramMakerData.position,
        size: (mockState.nodes as any)[nodeKey].diagramMakerData.size,
      }));
      expect(result).toBe(api);
      expect(createFitAction).toHaveBeenCalledTimes(1);
      expect(createFitAction).toHaveBeenCalledWith(expectedRects, undefined, undefined);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('dispatches fit action with all nodeKeys and returns itself', () => {
      const store = mockStore();
      const mockState = {
        nodes: {
          'node-1': {
            diagramMakerData: {
              position: { x: 10, y: 10 },
              size: { width: 10, height: 10 },
            },
          },
          'node-2': {
            diagramMakerData: {
              position: { x: 20, y: 20 },
              size: { width: 20, height: 20 },
            },
          },
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createFitAction).mockReturnValueOnce(action);

      const result = api.fit();

      const expectedNodeKeys = ['node-1', 'node-2'];
      const expectedRects = expectedNodeKeys.map((nodeKey) => ({
        position: (mockState.nodes as any)[nodeKey].diagramMakerData.position,
        size: (mockState.nodes as any)[nodeKey].diagramMakerData.size,
      }));
      expect(result).toBe(api);
      expect(createFitAction).toHaveBeenCalledTimes(1);
      expect(createFitAction).toHaveBeenCalledWith(expectedRects, undefined, undefined);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('dispatches fit action with all nodeKeys & left panel & right panel width and returns itself', () => {
      const store = mockStore();
      const mockState = {
        nodes: {
          'node-1': {
            diagramMakerData: {
              position: { x: 10, y: 10 },
              size: { width: 10, height: 10 },
            },
          },
          'node-2': {
            diagramMakerData: {
              position: { x: 20, y: 20 },
              size: { width: 20, height: 20 },
            },
          },
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      const leftPanelWidth = 100;
      const rightPanelWidth = 100;
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createFitAction).mockReturnValueOnce(action);

      const result = api.fit(leftPanelWidth, rightPanelWidth);

      const expectedNodeKeys = ['node-1', 'node-2'];
      const expectedRects = expectedNodeKeys.map((nodeKey) => ({
        position: (mockState.nodes as any)[nodeKey].diagramMakerData.position,
        size: (mockState.nodes as any)[nodeKey].diagramMakerData.size,
      }));
      expect(result).toBe(api);
      expect(createFitAction).toHaveBeenCalledTimes(1);
      expect(createFitAction).toHaveBeenCalledWith(expectedRects, leftPanelWidth, rightPanelWidth);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe('zoom in', () => {
    it('dispatches workspace zoom action and returns itself', () => {
      const viewContainerSize = { width: 10, height: 10 };
      const store = mockStore();
      const mockState = {
        workspace: {
          viewContainerSize,
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createZoomWorkspaceAction).mockReturnValueOnce(action);

      const zoom = 50;
      const result = api.zoomIn();

      const expectedPosition = {
        x: viewContainerSize.width / 2,
        y: viewContainerSize.height / 2,
      };
      expect(result).toBe(api);
      expect(createZoomWorkspaceAction).toHaveBeenCalledTimes(1);
      expect(createZoomWorkspaceAction).toHaveBeenCalledWith(zoom, expectedPosition);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('dispatches workspace zoom action with specific zoom and returns itself', () => {
      const viewContainerSize = { width: 10, height: 10 };
      const store = mockStore();
      const mockState = {
        workspace: {
          viewContainerSize,
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createZoomWorkspaceAction).mockReturnValueOnce(action);

      const zoom = 10;
      const result = api.zoomIn(zoom);

      const expectedPosition = {
        x: viewContainerSize.width / 2,
        y: viewContainerSize.height / 2,
      };
      expect(result).toBe(api);
      expect(createZoomWorkspaceAction).toHaveBeenCalledTimes(1);
      expect(createZoomWorkspaceAction).toHaveBeenCalledWith(zoom, expectedPosition);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe('zoom out', () => {
    it('dispatches workspace zoom action and returns itself', () => {
      const viewContainerSize = { width: 10, height: 10 };
      const store = mockStore();
      const mockState = {
        workspace: {
          viewContainerSize,
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createZoomWorkspaceAction).mockReturnValueOnce(action);

      const zoom = 50;
      const result = api.zoomOut();

      const expectedPosition = {
        x: viewContainerSize.width / 2,
        y: viewContainerSize.height / 2,
      };
      expect(result).toBe(api);
      expect(createZoomWorkspaceAction).toHaveBeenCalledTimes(1);
      expect(createZoomWorkspaceAction).toHaveBeenCalledWith(-zoom, expectedPosition);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });

    it('dispatches workspace zoom action with specific zoom and returns itself', () => {
      const viewContainerSize = { width: 10, height: 10 };
      const store = mockStore();
      const mockState = {
        workspace: {
          viewContainerSize,
        },
      };
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      asMock(store.getState).mockReturnValueOnce(mockState);
      asMock(createZoomWorkspaceAction).mockReturnValueOnce(action);

      const zoom = 10;
      const result = api.zoomOut(zoom);

      const expectedPosition = {
        x: viewContainerSize.width / 2,
        y: viewContainerSize.height / 2,
      };
      expect(result).toBe(api);
      expect(createZoomWorkspaceAction).toHaveBeenCalledTimes(1);
      expect(createZoomWorkspaceAction).toHaveBeenCalledWith(-zoom, expectedPosition);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe('resetZoom', () => {
    it('dispatches reset zoom action and returns itself', () => {
      const store = mockStore();
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };

      asMock(createWorkspaceResetZoomAction).mockImplementationOnce(() => action);

      const result = api.resetZoom();
      expect(result).toBe(api);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
      expect(createWorkspaceResetZoomAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('undo', () => {
    it('dispatches undo action and returns itself', () => {
      const store = mockStore();
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };

      asMock(undoActions.undo).mockImplementationOnce(() => action);

      const result = api.undo();
      expect(result).toBe(api);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
      expect(undoActions.undo).toHaveBeenCalledTimes(1);
    });
  });

  describe('redo', () => {
    it('dispatches redo action and returns itself', () => {
      const store = mockStore();
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };

      asMock(undoActions.redo).mockImplementationOnce(() => action);

      const result = api.redo();
      expect(result).toBe(api);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
      expect(undoActions.redo).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispatch', () => {
    it('dispatch a action, used for plugin', () => {
      const store = mockStore();
      const api = new DiagramMakerApi(store);
      const action = { type: 'MOCK_ACTION' };
      api.dispatch(action);
      expect(store.dispatch).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });
});
