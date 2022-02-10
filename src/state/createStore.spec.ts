import {
  applyMiddleware, compose, createStore as reduxCreateStore, Reducer,
} from 'redux';

import { getRootReducer } from 'diagramMaker/state/common/rootReducer';
import { sequenceReducers } from 'diagramMaker/state/common/sequenceReducers';
import { layoutReducer } from 'diagramMaker/state/layout';
import * as middleware from 'diagramMaker/state/middleware';
import { DiagramMakerWorkspace, EditorMode } from 'diagramMaker/state/types';
import { asMock } from 'diagramMaker/testing/testUtils';

import { DiagramMakerAction } from './actions';
import createStore from './createStore';
import { DiagramMakerData } from './types';

jest.mock('redux', () => ({
  applyMiddleware: jest.fn(),
  compose: jest.fn(),
  createStore: jest.fn(),
}));

jest.mock('diagramMaker/state/middleware', () => ({
  createInterceptorMiddleware: jest.fn(),
  getUndoMiddleware: jest.fn(),
}));

describe('createStore', () => {
  let initialData: DiagramMakerData<{}, {}>;
  let finalReducer: () => void;
  let consumerReducer: Reducer<DiagramMakerData<{}, {}>, DiagramMakerAction<{}, {}>>;
  let actionInterceptor: middleware.ActionInterceptor<{}, {}>;
  const nodes = {};
  const panels = {};
  const edges = {};
  const editor = {
    mode: EditorMode.DRAG,
  };
  const workspace: DiagramMakerWorkspace = {
    position: {
      x: 0,
      y: 0,
    },
    scale: 1,
    canvasSize: {
      width: 10,
      height: 10,
    },
    viewContainerSize: {
      width: 5,
      height: 5,
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    initialData = {
      nodes, edges, panels, workspace, editor,
    };
    finalReducer = jest.fn();
    consumerReducer = jest.fn();
    actionInterceptor = jest.fn();
  });

  it('calls redux create store with diagramMaker root reducer and layout reducer', () => {
    asMock(sequenceReducers).mockReturnValueOnce(finalReducer);

    createStore();
    expect(reduxCreateStore).toHaveBeenCalledWith(finalReducer, undefined, undefined);
    expect(sequenceReducers).toHaveBeenCalledWith(getRootReducer(), layoutReducer, undefined);
  });

  it('allows providing initialData', () => {
    asMock(sequenceReducers).mockReturnValueOnce(finalReducer);

    createStore(initialData);
    expect(reduxCreateStore).toHaveBeenCalledWith(finalReducer, initialData, undefined);
    expect(sequenceReducers).toHaveBeenCalledWith(getRootReducer(), layoutReducer, undefined);
  });

  it('sequences consumer reducer in the end, when it is provided', () => {
    asMock(sequenceReducers).mockReturnValueOnce(finalReducer);

    createStore(initialData, consumerReducer);
    expect(reduxCreateStore).toHaveBeenCalledWith(finalReducer, initialData, undefined);
    expect(sequenceReducers).toHaveBeenCalledWith(getRootReducer(), layoutReducer, consumerReducer);
  });

  it('calls createInterceptorMiddleware on actionInterceptor', () => {
    const createInterceptorMiddlewareSpy = jest.spyOn(middleware, 'createInterceptorMiddleware');

    createStore(initialData, consumerReducer, undefined, actionInterceptor);

    expect(createInterceptorMiddlewareSpy).toHaveBeenCalledTimes(1);
    expect(createInterceptorMiddlewareSpy).toHaveBeenCalledWith(actionInterceptor);
  });

  it('calls applyMiddleware on the return of createInterceptorMiddleware', () => {
    const createInterceptorMiddlewareMockValue = {};

    asMock(middleware.createInterceptorMiddleware).mockReturnValueOnce(createInterceptorMiddlewareMockValue);

    createStore(initialData, consumerReducer, undefined, actionInterceptor);

    expect(applyMiddleware).toHaveBeenCalledWith(createInterceptorMiddlewareMockValue);
    expect(applyMiddleware).toHaveBeenCalledTimes(2);
  });

  it('calls getUndoMiddleware', () => {
    const getUndoMiddlewareSpy = jest.spyOn(middleware, 'getUndoMiddleware');

    createStore(initialData, consumerReducer, undefined, actionInterceptor);

    expect(getUndoMiddlewareSpy).toHaveBeenCalledTimes(1);
  });

  it('calls applyMiddleware on the return of getUndoMiddleware', () => {
    const getUndoMiddlewareMockValue = {};

    asMock(middleware.getUndoMiddleware).mockReturnValueOnce(getUndoMiddlewareMockValue);

    createStore(initialData, consumerReducer, undefined, actionInterceptor);

    expect(applyMiddleware).toHaveBeenCalledWith(getUndoMiddlewareMockValue);
    expect(applyMiddleware).toHaveBeenCalledTimes(2);
  });

  it('calls compose on interceptor & undo middleware', () => {
    const getUndoMiddlewareMockValue = {};
    const createInterceptorMiddlewareMockValue = {};
    const undoMiddleware = {};
    const interceptorMiddleware = {};
    const composeMockValue = {};

    asMock(middleware.createInterceptorMiddleware).mockReturnValueOnce(createInterceptorMiddlewareMockValue);
    asMock(middleware.getUndoMiddleware).mockReturnValueOnce(getUndoMiddlewareMockValue);

    asMock(applyMiddleware).mockReturnValueOnce(interceptorMiddleware);
    asMock(applyMiddleware).mockReturnValueOnce(undoMiddleware);
    asMock(compose).mockReturnValueOnce(composeMockValue);

    createStore(initialData, consumerReducer, undefined, actionInterceptor);

    expect(applyMiddleware).toHaveBeenCalledWith(getUndoMiddlewareMockValue);
    expect(compose).toHaveBeenCalledTimes(1);
    expect(compose).toHaveBeenCalledWith(interceptorMiddleware, undoMiddleware);
  });

  it('calls compose on middleware and consumerEnhancer if the consumerEnhancer is specified', () => {
    const consumerEnhancer = jest.fn();
    const getUndoMiddlewareMockValue = {};
    const createInterceptorMiddlewareMockValue = {};
    const undoMiddleware = {};
    const interceptorMiddleware = {};
    const composeMockValue = {};
    const composeFinalValue = {};

    asMock(middleware.createInterceptorMiddleware).mockReturnValueOnce(createInterceptorMiddlewareMockValue);
    asMock(middleware.getUndoMiddleware).mockReturnValueOnce(getUndoMiddlewareMockValue);
    asMock(applyMiddleware).mockReturnValueOnce(interceptorMiddleware);
    asMock(applyMiddleware).mockReturnValueOnce(undoMiddleware);
    asMock(compose).mockReturnValueOnce(composeMockValue);
    asMock(compose).mockReturnValueOnce(composeFinalValue);
    asMock(sequenceReducers).mockReturnValueOnce(finalReducer);

    createStore(initialData, consumerReducer, consumerEnhancer, actionInterceptor);

    expect(applyMiddleware).toHaveBeenCalledWith(getUndoMiddlewareMockValue);
    expect(compose).toHaveBeenCalledTimes(2);
    expect(compose).toHaveBeenCalledWith(interceptorMiddleware, undoMiddleware);
    expect(compose).toHaveBeenCalledWith(composeMockValue, consumerEnhancer);
    expect(reduxCreateStore).toHaveBeenCalledWith(finalReducer, initialData, composeFinalValue);
  });

  it('does not call compose if the consumerEnhancer is specified', () => {
    const getUndoMiddlewareMockValue = {};
    const createInterceptorMiddlewareMockValue = {};
    const undoMiddleware = {};
    const interceptorMiddleware = {};
    const composeMockValue = {};

    asMock(middleware.createInterceptorMiddleware).mockReturnValueOnce(createInterceptorMiddlewareMockValue);
    asMock(middleware.getUndoMiddleware).mockReturnValueOnce(getUndoMiddlewareMockValue);
    asMock(applyMiddleware).mockReturnValueOnce(interceptorMiddleware);
    asMock(applyMiddleware).mockReturnValueOnce(undoMiddleware);
    asMock(compose).mockReturnValueOnce(composeMockValue);
    asMock(sequenceReducers).mockReturnValueOnce(finalReducer);

    createStore(initialData, consumerReducer, undefined, actionInterceptor);

    expect(applyMiddleware).toHaveBeenCalledWith(getUndoMiddlewareMockValue);
    expect(compose).toHaveBeenCalledTimes(1);
    expect(compose).toHaveBeenCalledWith(interceptorMiddleware, undoMiddleware);
    expect(reduxCreateStore).toHaveBeenCalledWith(finalReducer, initialData, composeMockValue);
  });
});
