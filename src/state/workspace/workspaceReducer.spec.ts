import set from 'lodash-es/set';

import { EditorActionsType, FitAction, FocusNodeAction } from 'diagramMaker/state/editor/editorActions';
import { DragNodeAction, NodeActionsType } from 'diagramMaker/state/node/nodeActions';
import { DiagramMakerWorkspace, Position } from 'diagramMaker/state/types';
import {
  DragWorkspaceAction,
  ResizeWorkspaceAction,
  WorkspaceActionsType,
  WorkspaceResetZoomAction,
  ZoomWorkspaceAction,
} from 'diagramMaker/state/workspace/workspaceActions';
import workspaceReducer from './workspaceReducer';

describe('workspaceReducer', () => {
  function checkReducerPurity(state: DiagramMakerWorkspace, expectedState: DiagramMakerWorkspace) {
    expect(state).toEqual(expectedState);
  }

  const getState1 = (testScale = 1): DiagramMakerWorkspace => ({
    position: {
      x: 0,
      y: 0,
    },
    scale: testScale,
    canvasSize: {
      width: 3200,
      height: 1600,
    },
    viewContainerSize: {
      width: 1600,
      height: 800,
    },
  });

  const getState2 = (): DiagramMakerWorkspace => ({
    position: {
      x: 0,
      y: 0,
    },
    scale: 1,
    canvasSize: {
      width: 800,
      height: 1600,
    },
    viewContainerSize: {
      width: 600,
      height: 1400,
    },
  });

  const getState3 = (): DiagramMakerWorkspace => ({
    position: {
      x: 10,
      y: 10,
    },
    scale: 0.75,
    canvasSize: {
      width: 800,
      height: 800,
    },
    viewContainerSize: {
      width: 600,
      height: 1400,
    },
  });

  const getMousePosition = (): Position => ({
    x: 100,
    y: 100,
  });

  it('initializes workspace when no workspace data exists', () => {
    const action: any = { type: 'randomAction' };
    expect(workspaceReducer(undefined, action)).toEqual(getState1());
  });

  it('does not change existing workspace state data when unknown action is fired', () => {
    const action: any = { type: 'randomAction' };
    expect(workspaceReducer(getState1(), action)).toEqual(getState1());
  });

  it('changes workspace position when workspace drag action is fired', () => {
    const state = getState1();
    const position = { x: -100, y: -100 };

    const action: DragWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_DRAG,
      payload: { position },
    };

    const expectedState = getState1();
    set(expectedState, 'position', position);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('changes workspace scale and adjusts position when workspace zoom action is fired', () => {
    const state = getState1();
    const position = getMousePosition();
    const zoom = 4;
    const expectedZoom = 1.024;
    const expectedPosition = {
      x: -2,
      y: -2,
    };

    const action: ZoomWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_ZOOM,
      payload: { zoom, position },
    };

    const expectedState = getState1();
    set(expectedState, 'scale', expectedZoom);
    set(expectedState, 'position', expectedPosition);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('prevents dragging past the top horizontal corner of the canvas', () => {
    const state = getState1();
    const position = { x: 10, y: 0 };

    const expectedState = getState1();
    const expectedPosition = { x: 0, y: 0 };
    set(expectedState, 'position', expectedPosition);

    const action: DragWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_DRAG,
      payload: { position },
    };

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('prevents dragging past the top vertical corner of the canvas', () => {
    const state = getState1();
    const position = { x: 0, y: 10 };

    const expectedState = getState1();
    const expectedPosition = { x: 0, y: 0 };
    set(expectedState, 'position', expectedPosition);

    const action: DragWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_DRAG,
      payload: { position },
    };

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('prevents dragging past the bottom horizontal corner of the canvas', () => {
    const state = getState1();
    const position = { x: (-1 * state.viewContainerSize.width) - 1, y: 0 };

    const expectedState = getState1();
    const expectedPosition = { x: -1 * state.viewContainerSize.width, y: 0 };
    set(expectedState, 'position', expectedPosition);

    const action: DragWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_DRAG,
      payload: { position },
    };

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('prevents dragging past the bottom vertical corner of the canvas', () => {
    const state = getState1();
    const position = { x: 0, y: (-1 * state.viewContainerSize.height) - 1 };

    const expectedState = getState1();
    const expectedPosition = { x: 0, y: -1 * state.viewContainerSize.height };
    set(expectedState, 'position', expectedPosition);

    const action: DragWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_DRAG,
      payload: { position },
    };

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('does not change workspace zoom past max zoom level', () => {
    const state = getState1();
    const position = getMousePosition();
    const zoom = 4000;
    const expectedZoom = 3;
    const expectedPosition = {
      x: -200,
      y: -200,
    };

    const action: ZoomWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_ZOOM,
      payload: { zoom, position },
    };

    const expectedState = getState1();
    set(expectedState, 'scale', expectedZoom);
    set(expectedState, 'position', expectedPosition);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('does not change workspace zoom past min zoom level', () => {
    const state = getState1();
    const position = getMousePosition();
    const zoom = -4000;
    const expectedZoom = 0.5;

    const action: ZoomWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_ZOOM,
      payload: { zoom, position },
    };

    const expectedState = getState1();
    set(expectedState, 'scale', expectedZoom);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('clamps min zoom when container width is greater than container height', () => {
    const state = getState1();
    const position = getMousePosition();
    const zoom = -4000;
    const expectedZoom = 0.5;

    const action: ZoomWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_ZOOM,
      payload: { zoom, position },
    };

    const expectedState = getState1();
    set(expectedState, 'scale', expectedZoom);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('clamps max zoom when container width is greater than container height', () => {
    const state = getState1();
    const position = getMousePosition();
    const zoom = 4000;
    const expectedZoom = 3;
    const expectedPosition = {
      x: -200,
      y: -200,
    };

    const action: ZoomWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_ZOOM,
      payload: { zoom, position },
    };

    const expectedState = getState1();
    set(expectedState, 'scale', expectedZoom);
    set(expectedState, 'position', expectedPosition);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState1());
  });

  it('clamps min zoom when container width is less than container height', () => {
    const state = getState2();
    const position = getMousePosition();
    const zoom = -4000;
    const expectedZoom = 0.875;

    const action: ZoomWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_ZOOM,
      payload: { zoom, position },
    };

    const expectedState = getState2();
    set(expectedState, 'scale', expectedZoom);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState2());
  });

  it('clamps max zoom when container width is less than container height', () => {
    const state = getState2();
    const position = getMousePosition();
    const zoom = 4000;
    const expectedZoom = 3;
    const expectedPosition = {
      x: -200,
      y: -200,
    };

    const action: ZoomWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_ZOOM,
      payload: { zoom, position },
    };

    const expectedState = getState2();
    set(expectedState, 'scale', expectedZoom);
    set(expectedState, 'position', expectedPosition);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState2());
  });

  it('changes view container size, zoom and position when workspace resize action is fired', () => {
    const state = getState3();
    const containerSize = { height: 1200, width: 1600 };
    const expectedZoom = 2;
    const expectedPosition = {
      x: 0,
      y: 0,
    };

    const action: ResizeWorkspaceAction = {
      type: WorkspaceActionsType.WORKSPACE_RESIZE,
      payload: { containerSize },
    };

    const expectedState = getState3();
    set(expectedState, 'viewContainerSize', containerSize);
    set(expectedState, 'scale', expectedZoom);
    set(expectedState, 'position', expectedPosition);

    expect(workspaceReducer(state, action)).toEqual(expectedState);
    checkReducerPurity(state, getState3());
  });

  describe('focus node action', () => {
    it('updates the position to center the node', () => {
      const id = 'test';
      const position = { x: 1000, y: 1000 };
      const size = { width: 100, height: 100 };
      const state = getState1();
      const action: FocusNodeAction = {
        type: EditorActionsType.FOCUS_NODE,
        payload: { id, position, size },
      };

      const expectedState = getState1();
      const expectedPosition = { x: -250, y: -650 };
      set(expectedState, 'position', expectedPosition);

      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });

    it('updates the position to center the node accounting for panels', () => {
      const id = 'test';
      const position = { x: 1000, y: 1000 };
      const size = { width: 100, height: 100 };
      const state = getState1();
      const action: FocusNodeAction = {
        type: EditorActionsType.FOCUS_NODE,
        payload: {
          id,
          position,
          size,
          leftPanelWidth: 50,
          rightPanelWidth: 100,
        },
      };

      const expectedState = getState1();
      const expectedPosition = { x: -275, y: -650 };
      set(expectedState, 'position', expectedPosition);

      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });
  });

  describe('reset zoom action', () => {
    it('updates the position to center the node', () => {
      const state = getState1(1.5);
      const action: WorkspaceResetZoomAction = {
        type: WorkspaceActionsType.WORKSPACE_RESET_ZOOM,
      };

      const expectedState = getState1(1.5);
      const expectedPosition = { x: -800, y: -400 };
      set(expectedState, 'scale', 1);
      set(expectedState, 'position', expectedPosition);

      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1(1.5));
    });
  });

  describe('fit action', () => {
    it('updates the scale to fit all nodes', () => {
      const nodeRect1 = {
        position: { x: 20, y: 20 },
        size: { width: 100, height: 100 },
      };
      const nodeRect2 = {
        position: { x: 3080, y: 1480 },
        size: { width: 100, height: 100 },
      };
      const state = getState1();
      const action: FitAction = {
        type: EditorActionsType.FIT,
        payload: {
          nodeRects: [nodeRect1, nodeRect2],
        },
      };

      const expectedState = getState1();
      set(expectedState, 'scale', 0.5);

      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });

    it('updates the position to fit all nodes', () => {
      const nodeRect1 = {
        position: { x: 150, y: 150 },
        size: { width: 100, height: 100 },
      };
      const nodeRect2 = {
        position: { x: 1550, y: 750 },
        size: { width: 100, height: 100 },
      };
      const state = getState1();
      const action: FitAction = {
        type: EditorActionsType.FIT,
        payload: {
          nodeRects: [nodeRect1, nodeRect2],
        },
      };

      const expectedState = getState1();
      const expectedPosition = { x: -100, y: -100 };
      set(expectedState, 'position', expectedPosition);

      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });

    it('updates the scale to fit all nodes accounting for fixed panels', () => {
      const nodeRect1 = {
        position: { x: 20, y: 20 },
        size: { width: 100, height: 100 },
      };
      const nodeRect2 = {
        position: { x: 2680, y: 1480 },
        size: { width: 100, height: 100 },
      };
      const state = getState1();
      const action: FitAction = {
        type: EditorActionsType.FIT,
        payload: {
          nodeRects: [nodeRect1, nodeRect2],
          leftPanelWidth: 100,
          rightPanelWidth: 100,
        },
      };

      const expectedState = getState1();
      set(expectedState, 'scale', 0.5);

      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });
  });

  describe('drag node outside workspace', () => {
    it('drag node outside right boundary', () => {
      const state = getState1();
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: {
          id: 'node-1',
          position: { x: 3200, y: 0 },
          workspaceRectangle: {
            position: { x: 0, y: 0 },
            size: { width: 3200, height: 1600 },
          },
          size: { width: 100, height: 100 },
        },
      };

      const expectedState = getState1();
      set(expectedState, 'canvasSize', { width: 3300, height: 1600 });
      set(expectedState, 'position', { x: -100, y: 0 });
      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });

    it('drag node outside bottom boundary', () => {
      const state = getState1();
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: {
          id: 'node-1',
          position: { x: 0, y: 1600 },
          workspaceRectangle: {
            position: { x: 0, y: 0 },
            size: { width: 3200, height: 1600 },
          },
          size: { width: 100, height: 100 },
        },
      };

      const expectedState = getState1();
      set(expectedState, 'canvasSize', { width: 3200, height: 1700 });
      set(expectedState, 'position', { x: 0, y: -100 });
      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });

    it('drag node outside top boundary', () => {
      const state = getState1();
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: {
          id: 'node-1',
          position: { x: 0, y: -100 },
          workspaceRectangle: {
            position: { x: 0, y: 0 },
            size: { width: 3200, height: 1600 },
          },
          size: { width: 100, height: 100 },
        },
      };

      const expectedState = getState1();
      set(expectedState, 'canvasSize', { width: 3200, height: 1700 });
      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });

    it('drag node outside left boundary', () => {
      const state = getState1();
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: {
          id: 'node-1',
          position: { x: -100, y: 0 },
          workspaceRectangle: {
            position: { x: 0, y: 0 },
            size: { width: 3200, height: 1600 },
          },
          size: { width: 100, height: 100 },
        },
      };

      const expectedState = getState1();
      set(expectedState, 'canvasSize', { width: 3300, height: 1600 });
      expect(workspaceReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state, getState1());
    });
  });
});
