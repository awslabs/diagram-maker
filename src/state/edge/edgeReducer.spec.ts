import omit from 'lodash-es/omit';
import set from 'lodash-es/set';

import { CreateItemsAction, DeleteItemsAction, GlobalActionsType } from 'diagramMaker/state/global/globalActions';
import { NodeActionsType, SelectNodeAction } from 'diagramMaker/state/node';
import { DiagramMakerEdge, DiagramMakerEdges } from 'diagramMaker/state/types';
import { DeselectAction, WorkspaceActionsType } from 'diagramMaker/state/workspace';

import { CreateEdgeAction, DeleteEdgeAction, EdgeActionsType, SelectEdgeAction } from './edgeActions';
import edgeReducer from './edgeReducer';

describe('edgeReducer', () => {

  const getState = (): DiagramMakerEdges<string> => ({
    'edge-1': {
      id: 'edge-1',
      src: 'node-1',
      dest: 'node-2',
      diagramMakerData: {},
      consumerData: undefined
    },
    'edge-2': {
      id: 'edge-2',
      src: 'node-3',
      dest: 'node-4',
      diagramMakerData: {},
      consumerData: undefined
    }
  });

  const createEdge = <EdgeType>(
    id: string, src: string, dest: string, consumerData?: EdgeType, diagramMakerData = {}
  ): DiagramMakerEdge<EdgeType> => ({
    id,
    src,
    dest,
    diagramMakerData,
    consumerData
  });

  function checkReducerPurity(state: DiagramMakerEdges<string>) {
    expect(state).toEqual(getState());
  }

  describe('init', () => {
    it('returns empty object if previous edge state is undefined', () => {
      const action: any = { type: 'randomAction' };
      expect(edgeReducer(undefined, action)).toEqual({});
    });
  });

  describe('unknown action', () => {
    it('returns old state', () => {
      const state = getState();
      const action: any = { type: 'randomAction' };
      expect(edgeReducer(state, action)).toBe(state);
      checkReducerPurity(state);
    });
  });

  describe('delete edge action', () => {
    it('deletes edge', () => {
      const state = getState();
      const action: DeleteEdgeAction = { type: EdgeActionsType.EDGE_DELETE, payload: { id: 'edge-1' } };
      expect(edgeReducer(state, action)).toEqual(omit(getState(), action.payload.id));
      checkReducerPurity(state);
    });

    it('returns old state when unknown edge is deleted', () => {
      const state = getState();
      const action: DeleteEdgeAction = { type: EdgeActionsType.EDGE_DELETE, payload: { id: 'edge-3' } };
      expect(edgeReducer(state, action)).toEqual(state);
      checkReducerPurity(state);
    });
  });

  describe('select edge action', () => {
    it('sets selection for selected edge & false everywhere else', () => {
      const state = getState();
      const action: SelectEdgeAction = { type: EdgeActionsType.EDGE_SELECT, payload: { id: 'edge-1' } };
      const expectedState = getState();
      set(expectedState, 'edge-1.diagramMakerData.selected', true);
      set(expectedState, 'edge-2.diagramMakerData.selected', false);
      expect(edgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('set selection to false everywhere when unknown edge is deleted', () => {
      const state = getState();
      const expectedState = getState();
      set(expectedState, 'edge-1.diagramMakerData.selected', false);
      set(expectedState, 'edge-2.diagramMakerData.selected', false);
      const action: SelectEdgeAction = { type: EdgeActionsType.EDGE_SELECT, payload: { id: 'edge-3' } };
      expect(edgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('create edge action', () => {
    it('creates and sets all props for the new edge', () => {
      const state = getState();
      const expectedState = getState();
      const id = 'edge-3';
      const src = 'node-5';
      const dest = 'node-6';
      const consumerData = 'testData';
      const diagramMakerData = {};
      const newEdge: DiagramMakerEdge<string> = { id, src, dest, diagramMakerData, consumerData };
      set(expectedState, id, newEdge);
      const action: CreateEdgeAction<string> = {
        type: EdgeActionsType.EDGE_CREATE, payload: { id, src, dest, consumerData }
      };
      expect(edgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('create items action', () => {
    it('creates and sets all props for new edges', () => {
      const state = getState();
      const expectedState = getState();
      const newEdge1 = createEdge('edge-3', 'node-5', 'node-6', 'testData1');
      const newEdge2 = createEdge('edge-4', 'node-7', 'node-8', 'testData2');
      set(expectedState, 'edge-3', newEdge1);
      set(expectedState, 'edge-4', newEdge2);
      const action: CreateItemsAction<void, string> = {
        type: GlobalActionsType.CREATE_ITEMS,
        payload: { nodes: [], edges: [newEdge1, newEdge2] }
      };
      expect(edgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('deselect action', () => {
    it('sets selected for all edges to false', () => {
      const state = getState();
      const expectedState = getState();
      set(expectedState, 'edge-1.diagramMakerData.selected', false);
      set(expectedState, 'edge-2.diagramMakerData.selected', false);
      const action: DeselectAction = { type: WorkspaceActionsType.WORKSPACE_DESELECT };
      expect(edgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('node select action', () => {
    it('sets selected for all edges to false', () => {
      const state = getState();
      const expectedState = getState();
      set(expectedState, 'edge-1.diagramMakerData.selected', false);
      set(expectedState, 'edge-2.diagramMakerData.selected', false);
      const action: SelectNodeAction = { type: NodeActionsType.NODE_SELECT, payload: { id: 'node-1' } };
      expect(edgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });

  describe('delete items action',  () => {
    it('deletes the given edges', () => {
      const state = getState();
      const expectedState = { ...state };
      delete expectedState['edge-1'];
      const payload = {
        edgeIds: ['edge-1'],
        nodeIds: []
      };
      const type = GlobalActionsType.DELETE_ITEMS;
      const action: DeleteItemsAction = { type, payload };
      expect(edgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });
  });
});
