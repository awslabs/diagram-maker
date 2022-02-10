import set from 'lodash-es/set';

import * as positionUtils from 'diagramMaker/service/positionUtils';
import { DiagramMakerPotentialNode } from 'diagramMaker/state/types';

import {
  DragEndPotentialNodeAction, DragPotentialNodeAction, DragStartPotentialNodeAction, NodeActionsType,
} from './nodeActions';
import potentialNodeReducer from './potentialNodeReducer';

describe('potentialNodeReducer', () => {
  const getState = (): DiagramMakerPotentialNode => ({
    typeId: 'node-1',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
  });

  const workspaceRectangle = {
    position: {
      x: 0, y: 0,
    },
    size: {
      height: 1000,
      width: 1000,
    },
  };

  function checkReducerPurity(state: DiagramMakerPotentialNode) {
    expect(state).toEqual(getState());
  }

  describe('init', () => {
    it('returns null if previous node state is undefined', () => {
      const action: any = { type: 'randomAction' };
      expect(potentialNodeReducer(undefined, action)).toEqual(null);
    });
  });

  describe('unknown action', () => {
    it('returns old state', () => {
      const state = getState();
      const action: any = { type: 'randomAction' };
      expect(potentialNodeReducer(state, action)).toBe(state);
      checkReducerPurity(state);
    });
  });

  describe('node drag start', () => {
    it('sets the type, position & size of the potential node', () => {
      const typeId = 'node-1';
      const position = { x: 0, y: 0 };
      const size = { width: 200, height: 200 };
      const action: DragStartPotentialNodeAction = {
        type: NodeActionsType.POTENTIAL_NODE_DRAG_START, payload: { typeId, position, size },
      };
      const expectedState = getState();
      expect(potentialNodeReducer(null, action)).toEqual(expectedState);
    });
  });

  describe('node drag', () => {
    it('sets the position of the potential node', () => {
      const state = getState();
      const position = { x: 10, y: 10 };
      const action: DragPotentialNodeAction = {
        type: NodeActionsType.POTENTIAL_NODE_DRAG,
        payload: { position, workspaceRectangle },
      };
      const expectedState = getState();
      const constrainRectangleWithinRectangleSpy = jest.spyOn(positionUtils, 'constrainRectangleWithinRectangle');
      set(expectedState, 'position', position);
      expect(potentialNodeReducer(state, action)).toEqual(expectedState);
      expect(constrainRectangleWithinRectangleSpy).toHaveBeenCalledTimes(1);
      checkReducerPurity(state);
    });

    it('doesnt do anything if current state is null', () => {
      const position = { x: 0, y: 0 };
      const action: DragPotentialNodeAction = {
        type: NodeActionsType.POTENTIAL_NODE_DRAG,
        payload: { position, workspaceRectangle },
      };
      expect(potentialNodeReducer(null, action)).toEqual(null);
    });
  });

  describe('node drag end', () => {
    it('returns null', () => {
      const state = getState();
      const action: DragEndPotentialNodeAction = {
        type: NodeActionsType.POTENTIAL_NODE_DRAG_END,
      };
      expect(potentialNodeReducer(state, action)).toBe(null);
      checkReducerPurity(state);
    });
  });
});
