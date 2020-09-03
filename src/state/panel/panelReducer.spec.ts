import * as positionUtils from 'diagramMaker/service/positionUtils';
import { DiagramMakerPanels, PositionAnchorType } from 'diagramMaker/state/types';

import {
  DragPanelAction,
  DragStartPanelAction,
  PanelActionsType,
  ResizePanelAction
} from './panelActions';
import panelReducer from './panelReducer';

describe('panelReducer', () => {
  const getState = (): DiagramMakerPanels => ({
    'panel-1': {
      id: 'panel-1',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 }
    },
    'panel-2': {
      id: 'panel-2',
      position: { x: 250, y: 0 },
      size: { width: 100, height: 200 }
    },
    'panel-3': {
      id: 'panel-3',
      position: { x: 250, y: 0 },
      size: { width: 50, height: 800 },
      positionAnchor: PositionAnchorType.TOP_LEFT
    },
    'panel-4': {
      id: 'panel-4',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      undocking: true
    },
    'panel-5': {
      id: 'panel-5',
      position: { x: 30, y: 30 },
      size: { width: 100, height: 100 },
      undocking: false
    }
  });

  const viewContainerSize = {
    height: 1000,
    width: 1000
  };

  function checkReducerPurity(state: DiagramMakerPanels) {
    expect(state).toEqual(getState());
  }

  it('returns empty object if previous panel state is undefined', () => {
    const action: any = { type: 'randomAction' };
    expect(panelReducer(undefined, action)).toEqual({});
  });

  it('returns old state when unknown action is passed', () => {
    const action: any = { type: 'randomAction' };
    const state: DiagramMakerPanels = getState();
    expect(panelReducer(state, action)).toBe(state);
  });

  describe('drag panel action', () => {
    it('updates panel position when panel is dragged', () => {
      const state = getState();
      const id = 'panel-1';
      const position = { x: 100, y: 100 };
      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const constrainRectangleWithinRectangleSpy = jest.spyOn(positionUtils, 'constrainRectangleWithinRectangle');
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-1': {
          id: 'panel-1',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 100 }
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      expect(constrainRectangleWithinRectangleSpy).toHaveBeenCalledTimes(1);
      checkReducerPurity(state);
    });

    it('returns old state when unknown panel is dragged', () => {
      const id = 'panel-200';
      const position =  { x: 100, y: 100 };
      const state = getState();
      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      expect(panelReducer(state, action)).toEqual(state);
      checkReducerPurity(state);
    });
  });

  describe('resize panel action', () => {
    it('updates panel size when panel is resized', () => {
      const state = getState();
      const action: ResizePanelAction = {
        type: PanelActionsType.PANEL_RESIZE,
        payload: { id: 'panel-1', size: { width: 150, height: 200 } }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-1': {
          id: 'panel-1',
          position: { x: 0, y: 0 },
          size: { width: 150, height: 200 }
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('returns old state when unknown panel is resized', () => {
      const state = getState();
      const action: ResizePanelAction = {
        type: PanelActionsType.PANEL_RESIZE,
        payload: {
          id: 'panel-200',
          size: { width: 150, height: 200 }
        }
      };
      expect(panelReducer(state, action)).toEqual(state);
      checkReducerPurity(state);
    });
  });

  describe('anchor panel drag start action', () => {
    it('updates panel dragging and undocking when panel drag is started and positionAnchor is defined', () => {
      const state = getState();
      const action: DragStartPanelAction = {
        type: PanelActionsType.PANEL_DRAG_START,
        payload: { id: 'panel-3' }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-3': {
          id: 'panel-3',
          position: { x: 250, y: 0 },
          size: { width: 50, height: 800 },
          undocking: true
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('updates panel dragging and undocking when panel drag is started and positionAnchor is undefined', () => {
      const state = getState();
      const action: DragStartPanelAction = {
        type: PanelActionsType.PANEL_DRAG_START,
        payload: { id: 'panel-1' }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-1': {
          id: 'panel-1',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          undocking: false
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('anchor panel drag action', () => {
    it('does not change state when panel is not dragging', () => {
      const state = getState();
      const id = 'panel-2';
      const position = { x: 250, y: 0 };
      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-2': {
          id: 'panel-2',
          position: { x: 250, y: 0 },
          size: { width: 100, height: 200 }
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('changes panel position when dragging and undocking', () => {
      const state = getState();
      const id = 'panel-4';
      const position = { x: 100, y: 100 };
      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-4': {
          id: 'panel-4',
          position: { x: 100, y: 100 },
          size: { width: 100, height: 100 },
          undocking: false
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('docks panel to top left when dragging and docking', () => {
      const state = getState();
      const dockX = 5;
      const dockY = 5;
      const id = 'panel-5';
      const position = { x: dockX, y: dockY };

      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-5': {
          id: 'panel-5',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          positionAnchor: PositionAnchorType.TOP_LEFT,
          undocking: false
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('docks panel to top right when dragging and docking', () => {
      const state = getState();
      const dockX = 895;
      const dockY = 5;
      const id = 'panel-5';
      const position = { x: dockX, y: dockY };

      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-5': {
          id: 'panel-5',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          positionAnchor: PositionAnchorType.TOP_RIGHT,
          undocking: false
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('docks panel to bottom left when dragging and docking', () => {
      const state = getState();
      const dockX = 5;
      const dockY = 895;
      const id = 'panel-5';
      const position = { x: dockX, y: dockY };

      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-5': {
          id: 'panel-5',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          positionAnchor: PositionAnchorType.BOTTOM_LEFT,
          undocking: false
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('docks panel to bottom right when dragging and docking', () => {
      const state = getState();
      const dockX = 895;
      const dockY = 895;
      const id = 'panel-5';
      const position =  { x: dockX, y: dockY };

      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-5': {
          id: 'panel-5',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          positionAnchor: PositionAnchorType.BOTTOM_RIGHT,
          undocking: false
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('docks panel to bottom right when dragging past drag handle and docking', () => {
      const state = getState();
      const dockX = 10000;
      const dockY = 10000;
      const id = 'panel-5';
      const position =  { x: dockX, y: dockY };

      const action: DragPanelAction = {
        type: PanelActionsType.PANEL_DRAG,
        payload: {
          id,
          position,
          viewContainerSize
        }
      };
      const expectedState: DiagramMakerPanels = {
        ...state,
        'panel-5': {
          id: 'panel-5',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          positionAnchor: PositionAnchorType.BOTTOM_RIGHT,
          undocking: false
        }
      };
      expect(panelReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });
});
