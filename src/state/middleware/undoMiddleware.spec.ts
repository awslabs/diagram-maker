jest.mock('diagramMaker/state/global/globalActionDispatcher', () => ({
  createDeleteItemsAction: jest.fn(),
  createNewItemsAction: jest.fn()
}));

jest.mock('redux-undo-redo', () => ({
  createUndoMiddleware: jest.fn()
}));

import {
  createUndoMiddleware, RevertingActionsFunction, RevertingActionsObject, UndoMiddlewareConfig
} from 'redux-undo-redo';

import { CreateEdgeAction, EdgeActions, EdgeActionsType } from 'diagramMaker/state/edge/edgeActions';
import { createDeleteItemsAction, createNewItemsAction } from 'diagramMaker/state/global/globalActionDispatcher';
import { DeleteItemsAction, GlobalActions } from 'diagramMaker/state/global/globalActions';
import { CreateNodeAction, NodeActions, NodeActionsType } from 'diagramMaker/state/node/nodeActions';
import { DiagramMakerData } from 'diagramMaker/state/types';
import { asMock } from 'diagramMaker/testing/testUtils';

import { getUndoMiddleware } from './undoMiddleware';

describe('undoMiddleware', () => {

  beforeEach(() => jest.clearAllMocks());

  it('calls createUndoMiddleware passing the config', () => {
    getUndoMiddleware();
    expect(createUndoMiddleware).toHaveBeenCalledTimes(1);
  });

  describe('reverting actions', () => {
    let configObject: UndoMiddlewareConfig<{}>;
    asMock(createUndoMiddleware).mockImplementationOnce(object => configObject = object);
    getUndoMiddleware();

    describe('edge create', () => {
      const revertFunc = configObject.revertingActions[EdgeActions.EDGE_CREATE] as RevertingActionsFunction;
      it('calls createDeleteItemsAction with edge id', () => {
        const id = 'edge-1';
        const edgeCreateAction: CreateEdgeAction<void> = {
          type: EdgeActionsType.EDGE_CREATE,
          payload: {
            id,
            src: 'node-1',
            dest: 'node-2'
          }
        };
        const action = { type: 'MOCK_ACTION' };
        asMock(createDeleteItemsAction).mockImplementationOnce(() => action);
        expect(revertFunc(edgeCreateAction)).toBe(action);
        expect(createDeleteItemsAction).toHaveBeenCalledTimes(1);
        expect(createDeleteItemsAction).toHaveBeenCalledWith([], [id]);
      });
    });

    describe('node create', () => {
      const revertFunc = configObject.revertingActions[NodeActions.NODE_CREATE] as RevertingActionsFunction;
      it('calls createDeleteItemsAction with node id', () => {
        const id = 'node-1';
        const typeId = 'start-node';
        const position = { x: 10, y: 10 };
        const size = { width: 10, height: 10 };
        const nodeCreateAction: CreateNodeAction<void> = {
          type: NodeActionsType.NODE_CREATE,
          payload: {
            id,
            typeId,
            position,
            size
          }
        };
        const action = { type: 'MOCK_ACTION' };
        asMock(createDeleteItemsAction).mockImplementationOnce(() => action);
        expect(revertFunc(nodeCreateAction)).toBe(action);
        expect(createDeleteItemsAction).toHaveBeenCalledTimes(1);
        expect(createDeleteItemsAction).toHaveBeenCalledWith([id], []);
      });
    });

    describe('delete items', () => {
      const revertObj =
        configObject.revertingActions[GlobalActions.DELETE_ITEMS] as RevertingActionsObject<DiagramMakerData<{}, {}>>;
      const revertFunc = revertObj.action;
      const createArgs = revertObj.createArgs;
      it('calls createNewItemsAction with node id', () => {
        const node = {
          id: 'node-1'
        };
        const nodes = [node];
        const edge = {
          id: 'edge-1'
        };
        const edges = [edge];
        const args = {
          edges,
          nodes
        };
        const state: any = {
          edges: {
            'edge-1': edge
          },
          nodes: {
            'node-1': node
          }
        };
        const deleteItemsAction: DeleteItemsAction = {
          type: GlobalActions.DELETE_ITEMS,
          payload: {
            nodeIds: ['node-1'],
            edgeIds: ['edge-1']
          }
        };
        const action = { type: 'MOCK_ACTION' };
        asMock(createNewItemsAction).mockImplementationOnce(() => action);
        expect(revertFunc(deleteItemsAction, args)).toBe(action);
        expect(createNewItemsAction).toHaveBeenCalledTimes(1);
        expect(createNewItemsAction).toHaveBeenCalledWith(nodes, edges);
        expect(createArgs(state, deleteItemsAction)).toEqual({
          edges,
          nodes
        });
      });
    });
  });

});
