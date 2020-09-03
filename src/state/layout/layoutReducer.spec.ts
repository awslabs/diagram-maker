jest.unmock('./layoutReducer');
jest.mock('./hierarchicalLayout', () => ({ default: jest.fn() }));
jest.mock('./workflowLayout', () => ({ default: jest.fn() }));

import getInitialState from 'diagramMaker/state/getInitialState';
import { DeleteItemsAction, GlobalActionsType } from 'diagramMaker/state/global/globalActions';
import { DiagramMakerData, EditorMode } from 'diagramMaker/state/types';
import { asMock } from 'diagramMaker/testing/testUtils';
import set from 'lodash-es/set';

import hierarchicalLayout from './hierarchicalLayout';
import {
  HierarchicalLayoutConfig, LayoutAction, LayoutActionsType, LayoutConfig, LayoutType,
  WorkflowLayoutConfig, WorkflowLayoutDirection
} from './layoutActions';
import layoutReducer, { adjustWorkspace } from './layoutReducer';
import workflowLayout from './workflowLayout';

describe('layoutReducer', () => {

  function getState(): DiagramMakerData<{}, {}> {
    return getInitialState();
  }

  /**
   * Verifies that initial `state` (that was initialized before applying reducer)
   * is not modified by the reducer.
   *
   * @param state - The original state passed to reducer. (Not the output of the reducer!)
   */
  function checkReducerPurity(state: DiagramMakerData<{}, {}>) {
    expect(state).toEqual(getState());
  }

  describe('layout action', () => {
    describe('hierarchical layout', () => {
      it('calls "hierarchicalLayout" function with the provided layout config', () => {
        const state = getState();
        const layoutConfig: HierarchicalLayoutConfig = {
          layoutType: LayoutType.HIERARCHICAL,
          fixedNodeIds: ['node-1', 'node-5'],
          distanceMin: 123,
          distanceDeclineRate: 0.45
        };
        const action: LayoutAction = {
          type: LayoutActionsType.LAYOUT,
          payload: layoutConfig
        };
        asMock(hierarchicalLayout).mockImplementationOnce(() => state);

        expect(layoutReducer(state, action)).toEqual(state);
        expect(hierarchicalLayout).toBeCalledTimes(1);
        expect(hierarchicalLayout).toBeCalledWith(state, layoutConfig);
        checkReducerPurity(state);
      });
    });

    describe('workflow layout', () => {
      it('calls "workflowLayout" function with the provided layout config', () => {
        const state = getState();
        const layoutConfig: WorkflowLayoutConfig = {
          layoutType: LayoutType.WORKFLOW,
          direction: WorkflowLayoutDirection.TOP_BOTTOM,
          distanceMin: 123
        };
        const action: LayoutAction = {
          type: LayoutActionsType.LAYOUT,
          payload: layoutConfig
        };
        asMock(workflowLayout).mockImplementationOnce(() => state);

        expect(layoutReducer(state, action)).toEqual(state);
        expect(workflowLayout).toBeCalledTimes(1);
        expect(workflowLayout).toBeCalledWith(state, layoutConfig);
        checkReducerPurity(state);
      });
    });

    describe('unrecognized layout', () => {
      it('does not modify state', () => {
        const state = getState();
        const action: LayoutAction = {
          type: LayoutActionsType.LAYOUT,
          payload: { layoutType: 'rainbow layout' } as any as LayoutConfig
        };
        expect(layoutReducer(state, action)).toEqual(state);
        checkReducerPurity(state);
      });
    });
  });

  describe('unrecognized action', () => {
    it('does not modify state, when action is not recognized', () => {
      const state = getState();
      const action: DeleteItemsAction = {
        type: GlobalActionsType.DELETE_ITEMS,
        payload: { nodeIds: [], edgeIds: [] }
      };
      expect(layoutReducer(state, action)).toBe(state);
    });
  });

  describe('empty state', () => {
    it('initializes state using `getInitialState()`, when provided state is empty', () => {
      const action: DeleteItemsAction = {
        type: GlobalActionsType.DELETE_ITEMS,
        payload: { nodeIds: [], edgeIds: [] }
      };
      expect(layoutReducer(undefined, action)).toEqual(getInitialState());
    });
  });
});

describe('adjustWorkspace', () => {
  it('modify state, when nodes beyond bottom right boundary', () => {
    const state: any = {
      nodes: {
        node1: {
          diagramMakerData: {
            position: { x: 100, y: 100 },
            size: { height: 100, width: 100 }
          },
          id: 'node1'
        }
      },
      workspace:{
        canvasSize: {
          height: 100,
          width: 100
        },
        position: {
          x: 0,
          y: 0
        }
      }
    };
    const expectedState = {
      nodes: {
        node1: {
          diagramMakerData: {
            position: { x: 100, y: 100 },
            size: { height: 100, width: 100 }
          },
          id: 'node1'
        }
      },
      workspace:{
        canvasSize: {
          height: 200,
          width: 200
        },
        position: {
          x: 0,
          y: 0
        }
      }
    };
    expect(adjustWorkspace(state)).toEqual(expectedState);
  });

  it('modify state, when nodes beyond top left boundary', () => {
    const state: any = {
      nodes: {
        node1: {
          diagramMakerData: {
            position: { x: -100, y: -100 },
            size: { height: 100, width: 100 }
          },
          id: 'node1'
        }
      },
      workspace:{
        canvasSize: {
          height: 100,
          width: 100
        },
        position: {
          x: 0,
          y: 0
        }
      }
    };
    const expectedState = {
      nodes: {
        node1: {
          diagramMakerData: {
            position: { x: 0, y: 0 },
            size: { height: 100, width: 100 }
          },
          id: 'node1'
        }
      },
      workspace:{
        canvasSize: {
          height: 200,
          width: 200
        },
        position: {
          x: 0,
          y: 0
        }
      }
    };
    expect(adjustWorkspace(state)).toEqual(expectedState);
  });
});
