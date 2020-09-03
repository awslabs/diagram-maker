import set from 'lodash-es/set';

import { DiagramMakerPotentialEdge } from 'diagramMaker/state/types';

import { DragEdgeAction, DragEndEdgeAction, DragStartEdgeAction, EdgeActionsType } from './edgeActions';
import potentialEdgeReducer from './potentialEdgeReducer';

describe('potentialEdgeReducer', () => {

  const getState = (): DiagramMakerPotentialEdge => ({
    src: 'node-1',
    position: { x: 0, y: 0 }
  });

  function checkReducerPurity(state: DiagramMakerPotentialEdge) {
    expect(state).toEqual(getState());
  }

  describe('init', () => {
    it('returns null if previous edge state is undefined', () => {
      const action: any = { type: 'randomAction' };
      expect(potentialEdgeReducer(undefined, action)).toEqual(null);
    });
  });

  describe('unknown action', () => {
    it('returns old state', () => {
      const state = getState();
      const action: any = { type: 'randomAction' };
      expect(potentialEdgeReducer(state, action)).toBe(state);
      checkReducerPurity(state);
    });
  });

  describe('edge drag start', () => {
    it('sets the src of the potential edge', () => {
      const id = 'node-1';
      const position = { x: 0, y: 0 };
      const action: DragStartEdgeAction = { type: EdgeActionsType.EDGE_DRAG_START, payload: { id, position } };
      const expectedState = getState();
      set(expectedState, 'src', 'node-1');
      expect(potentialEdgeReducer(null, action)).toEqual(expectedState);
    });
  });

  describe('edge drag', () => {
    it('sets the position of the potential edge', () => {
      const state = getState();
      const position = { x: 10, y: 10 };
      const action: DragEdgeAction = { type: EdgeActionsType.EDGE_DRAG, payload: { position } };
      const expectedState = getState();
      set(expectedState, 'position', position);
      expect(potentialEdgeReducer(state, action)).toEqual(expectedState);
      checkReducerPurity(state);
    });

    it('doesnt do anything if current state is null', () => {
      const position = { x: 0, y: 0 };
      const action: DragEdgeAction = { type: EdgeActionsType.EDGE_DRAG, payload: { position } };
      expect(potentialEdgeReducer(null, action)).toEqual(null);
    });
  });

  describe('edge drag end', () => {
    it('returns null', () => {
      const state = getState();
      const action: DragEndEdgeAction = { type: EdgeActionsType.EDGE_DRAG_END };
      expect(potentialEdgeReducer(state, action)).toBe(null);
      checkReducerPurity(state);
    });
  });

});
