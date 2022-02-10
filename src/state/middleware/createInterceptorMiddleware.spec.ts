import { Dispatch } from 'redux';

import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { NodeActionsType } from 'diagramMaker/state/node';

import { createInterceptorMiddleware } from '.';

describe('interceptor middleware', () => {
  let dispatch: Dispatch;
  let getState: () => {};
  let action: DiagramMakerAction<{}, {}>;
  let next: Dispatch;

  beforeEach(() => {
    dispatch = jest.fn();
    getState = jest.fn();
    action = {
      payload: {
        id: '1234', typeId: '5678', position: { x: 0, y: 0 }, size: { width: 10, height: 10 },
      },
      type: NodeActionsType.NODE_CREATE,
    };
    next = jest.fn();
  });

  it('calls next(action) if there is no action interceptor', () => {
    const interceptorMiddleware = createInterceptorMiddleware();
    const nextHandler = interceptorMiddleware({ dispatch, getState });
    const actionHandler = nextHandler(next);

    actionHandler(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('passes the action & next & getState method to the action interceptor', () => {
    const actionInterceptor = jest.fn();
    const interceptorMiddleware = createInterceptorMiddleware(actionInterceptor);
    const nextHandler = interceptorMiddleware({ dispatch, getState });
    const actionHandler = nextHandler(next);

    actionHandler(action);

    expect(actionInterceptor).toHaveBeenCalledWith(action, next, getState);
    expect(actionInterceptor).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});
