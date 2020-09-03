import merge from 'lodash-es/merge';
import omit from 'lodash-es/omit';
import set from 'lodash-es/set';

import * as positionUtils from 'diagramMaker/service/positionUtils';
import { EdgeActionsType, SelectEdgeAction } from 'diagramMaker/state/edge';
import {
  EditorActionsType, FocusNodeAction, UpdateSelectionMarqueeAction
} from 'diagramMaker/state/editor/editorActions';
import { CreateItemsAction, DeleteItemsAction, GlobalActionsType } from 'diagramMaker/state/global/globalActions';
import { DiagramMakerNode, DiagramMakerNodes, Position, Size } from 'diagramMaker/state/types';
import { DeselectAction, WorkspaceActionsType } from 'diagramMaker/state/workspace';
import { SelectAllAction } from 'diagramMaker/state/workspace/workspaceActions';

import {
  CreateNodeAction, DeleteNodeAction, DragEndNodeAction, DragNodeAction,
  DragStartNodeAction, NodeActionsType, SelectNodeAction
} from './nodeActions';
import nodeReducer from './nodeReducer';

describe('nodeReducer', () => {

  const getState = (): DiagramMakerNodes<string> => ({
    'node-1': {
      id: 'node-1',
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 }
      },
      consumerData: undefined
    },
    'node-2': {
      id: 'node-2',
      diagramMakerData: {
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 }
      },
      consumerData: undefined
    }
  });

  const workspaceRectangle = {
    position: {
      x: 0, y: 0
    },
    size: {
      height: 1000,
      width: 1000
    }
  };

  const createNode = <NodeType>(
    id: string,
    consumerData?: NodeType,
    diagramMakerData = { position: { x: 10, y: 10 }, size: { width: 10, height: 10 } }
  ): DiagramMakerNode<NodeType> => ({
    id,
    diagramMakerData,
    consumerData
  });

  /**
   * Verifies that initial `state` (that was initialized before applying reducer)
   * is not modified by the reducer.
   *
   * @param state - The original state passed to reducer. (Not the output of the reducer!)
   */
  function checkReducerPurity(state: DiagramMakerNodes<string>) {
    expect(state).toEqual(getState());
  }

  describe('init', () => {
    it('returns empty object if previous node state is undefined', () => {
      const action: any = { type: 'randomAction' };
      expect(nodeReducer(undefined, action)).toEqual({});
    });
  });

  describe('unknown action', () => {
    it('returns old state', () => {
      const state = getState();
      const action: any = { type: 'randomAction' };
      expect(nodeReducer(state, action)).toBe(state);
      checkReducerPurity(state);
    });
  });

  describe('create node action', () => {
    it('creates node', () => {
      const state = getState();
      const id = 'node-1';
      const typeId = 'node-type-1';
      const position = { x: 0, y: 0 };
      const size = { width: 200, height: 200 };
      const diagramMakerData = { position, size };
      const consumerData = 'testData';
      const action: CreateNodeAction<string> = {
        type: NodeActionsType.NODE_CREATE, payload: { id, typeId, position, size, consumerData }
      };
      const nodeState = { id, typeId, diagramMakerData, consumerData };
      expect(nodeReducer(state, action)).toEqual(merge(getState(), { 'node-1': nodeState }));
      checkReducerPurity(state);
    });
  });

  describe('create items action', () => {
    it('creates and sets all props for new nodes', () => {
      const state = getState();
      const expectedState = getState();
      const newNode1 = createNode('node-3', 'testData1');
      const newNode2 = createNode('node-4', 'testData2');
      set(expectedState, 'node-3', newNode1);
      set(expectedState, 'node-4', newNode2);
      const action: CreateItemsAction<string, void> = {
        type: GlobalActionsType.CREATE_ITEMS,
        payload: { nodes: [newNode1, newNode2], edges: [] }
      };
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('delete node action', () => {
    it('deletes node', () => {
      const state = getState();
      const action: DeleteNodeAction = { type: NodeActionsType.NODE_DELETE, payload: { id: 'node-1' } };
      expect(nodeReducer(state, action)).toEqual(omit(getState(), action.payload.id));
      checkReducerPurity(state);
    });

    it('returns old state when unknown node is deleted', () => {
      const state = getState();
      const action: DeleteNodeAction = { type: NodeActionsType.NODE_DELETE, payload: { id: 'node-3' } };
      expect(nodeReducer(state, action)).toEqual(state);
      checkReducerPurity(state);
    });
  });

  describe('select node action', () => {
    it('sets selection for selected node & false everywhere else', () => {
      const state = getState();
      const action: SelectNodeAction = { type: NodeActionsType.NODE_SELECT, payload: { id: 'node-1' } };
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.selected', true);
      set(expectedState, 'node-2.diagramMakerData.selected', false);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('set selection to false everywhere when unknown node is selected', () => {
      const state = getState();
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.selected', false);
      set(expectedState, 'node-2.diagramMakerData.selected', false);
      const action: SelectNodeAction = { type: NodeActionsType.NODE_SELECT, payload: { id: 'node-3' } };
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('workspace select all action', () => {
    it('sets selection for all nodes', () => {
      const state = getState();
      const action: SelectAllAction = { type: WorkspaceActionsType.WORKSPACE_SELECT_ALL };
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.selected', true);
      set(expectedState, 'node-2.diagramMakerData.selected', true);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('focus node action', () => {
    it('sets selection for selected node & false everywhere else', () => {
      const state = getState();
      const action: FocusNodeAction = {
        type: EditorActionsType.FOCUS_NODE,
        payload: { id: 'node-1', position: { x: 10, y: 10 }, size: { width: 10, height: 10 } }
      };
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.selected', true);
      set(expectedState, 'node-2.diagramMakerData.selected', false);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('set selection to false everywhere when unknown node is selected', () => {
      const state = getState();
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.selected', false);
      set(expectedState, 'node-2.diagramMakerData.selected', false);
      const action: FocusNodeAction = {
        type: EditorActionsType.FOCUS_NODE,
        payload: { id: 'node-3', position: { x: 10, y: 10 }, size: { width: 10, height: 10 } }
      };
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('drag end node action', () => {
    it('unsets dragging for passed node id', () => {
      const state = getState();
      const action: DragEndNodeAction = { type: NodeActionsType.NODE_DRAG_END, payload: { id: 'node-1' } };
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.dragging', false);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('returns old state when unknown node id is passed', () => {
      const state = getState();
      const action: DragEndNodeAction = { type: NodeActionsType.NODE_DRAG_END, payload: { id: 'node-3' } };
      expect(nodeReducer(state, action)).toEqual(state);
      checkReducerPurity(state);
    });
  });

  describe('drag start node action', () => {
    it('sets dragging for passed node id', () => {
      const state = getState();
      const action: DragStartNodeAction = { type: NodeActionsType.NODE_DRAG_START, payload: { id: 'node-1' } };
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.dragging', true);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('returns old state when unknown node id is passed', () => {
      const state = getState();
      const action: DragStartNodeAction = { type: NodeActionsType.NODE_DRAG_START, payload: { id: 'node-3' } };
      expect(nodeReducer(state, action)).toEqual(state);
      checkReducerPurity(state);
    });
  });

  describe('drag node action', () => {
    it('sets position for passed node id', () => {
      const state = getState();
      const position = { x: 10, y: 10 };
      const id = 'node-1';
      const size = { height: 100, width: 100 };
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: { id, position, workspaceRectangle, size }
      };
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.position', position);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('drag node outside top boundary', () => {
      const state = getState();
      const position = { x: 0, y: -50 };
      const id = 'node-1';
      const size = { height: 100, width: 100 };
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: { id, position, workspaceRectangle, size }
      };
      const expectedState = getState();
      const node1Pos = { x: 0, y: 0 };
      const node2Pos = { x: 0, y: 50 };
      set(expectedState, 'node-1.diagramMakerData.position', node1Pos);
      set(expectedState, 'node-2.diagramMakerData.position', node2Pos);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('drag node outside left boundary', () => {
      const state = getState();
      const position = { x: -50, y: 0 };
      const id = 'node-1';
      const size = { height: 100, width: 100 };
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: { id, position, workspaceRectangle, size }
      };
      const expectedState = getState();
      const node1Pos = { x: 0, y: 0 };
      const node2Pos = { x: 50, y: 0 };
      set(expectedState, 'node-1.diagramMakerData.position', node1Pos);
      set(expectedState, 'node-2.diagramMakerData.position', node2Pos);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('drag node outside right boundary', () => {
      const state = getState();
      const position = { x: 1100, y: 0 };
      const id = 'node-1';
      const size = { height: 100, width: 100 };
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: { id, position, workspaceRectangle, size }
      };
      const expectedState = getState();
      const node1Pos = { x: 1100, y: 0 };
      set(expectedState, 'node-1.diagramMakerData.position', node1Pos);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('drag node outside bottom boundary', () => {
      const state = getState();
      const position = { x: 0, y: 1100 };
      const id = 'node-1';
      const size = { height: 100, width: 100 };
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: { id, position, workspaceRectangle, size }
      };
      const expectedState = getState();
      const node1Pos = { x: 0, y: 1100 };
      set(expectedState, 'node-1.diagramMakerData.position', node1Pos);
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('returns old state when unknown node id is passed', () => {
      const state = getState();
      const position = { x: 0, y: 0 };
      const id = 'node-3';
      const size = { height: 10, width: 10 };
      const action: DragNodeAction = {
        type: NodeActionsType.NODE_DRAG,
        payload: { id, position, workspaceRectangle, size }
      };
      expect(nodeReducer(state, action)).toEqual(state);
      checkReducerPurity(state);
    });
  });

  describe('update selection marquee action', () => {
    describe('nodes within bounding box', () => {
      it('selects nodes entirely within marquee', () => {
        const state = getState();
        const anchor: Position = { x: 0, y: 0 };
        const position: Position = { x: 200, y: 200 };
        const action: UpdateSelectionMarqueeAction = {
          type: EditorActionsType.UPDATE_SELECTION_MARQUEE,
          payload: {
            anchor,
            position
          }
        };
        const expectedState = getState();
        set(expectedState, 'node-1.diagramMakerData.selected', true);
        set(expectedState, 'node-2.diagramMakerData.selected', true);
        expect(nodeReducer(state, action)).toEqual(expectedState);
        checkReducerPurity(state);
      });

      it('selects nodes partially within marquee', () => {
        const state = getState();
        const anchor: Position = { x: 50, y: 50 };
        const position: Position = { x: 70, y: 70 };
        const action: UpdateSelectionMarqueeAction = {
          type: EditorActionsType.UPDATE_SELECTION_MARQUEE,
          payload: {
            anchor,
            position
          }
        };
        const expectedState = getState();
        set(expectedState, 'node-1.diagramMakerData.selected', true);
        set(expectedState, 'node-2.diagramMakerData.selected', true);
        expect(nodeReducer(state, action)).toEqual(expectedState);
        checkReducerPurity(state);
      });
    });

    describe('nodes outside bounding box', () => {
      it('does not select nodes outside marquee', () => {
        const state = getState();
        const anchor: Position = { x: 200, y: 200 };
        const position: Position = { x: 300, y: 300 };
        const action: UpdateSelectionMarqueeAction = {
          type: EditorActionsType.UPDATE_SELECTION_MARQUEE,
          payload: {
            anchor,
            position
          }
        };
        const expectedState = getState();
        set(expectedState, 'node-1.diagramMakerData.selected', false);
        set(expectedState, 'node-2.diagramMakerData.selected', false);
        expect(nodeReducer(state, action)).toEqual(expectedState);
        checkReducerPurity(state);
      });
    });
  });

  describe('deselect action', () => {
    it('sets selected for all nodes to false', () => {
      const state = getState();
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.selected', false);
      set(expectedState, 'node-2.diagramMakerData.selected', false);
      const action: DeselectAction = { type: WorkspaceActionsType.WORKSPACE_DESELECT };
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('edge select action', () => {
    it('sets selected for all nodes to false', () => {
      const state = getState();
      const expectedState = getState();
      set(expectedState, 'node-1.diagramMakerData.selected', false);
      set(expectedState, 'node-2.diagramMakerData.selected', false);
      const action: SelectEdgeAction = { type: EdgeActionsType.EDGE_SELECT, payload: { id: 'edge-1' } };
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('delete items action',  () => {
    it('deletes the given nodes', () => {
      const state = getState();
      const expectedState = { ...state };
      delete expectedState['node-2'];
      const payload = {
        edgeIds: [],
        nodeIds: ['node-2']
      };
      const type = GlobalActionsType.DELETE_ITEMS;
      const action: DeleteItemsAction = { type, payload };
      expect(nodeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });
});
