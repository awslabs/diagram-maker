import { DiagramMakerData } from 'diagramMaker/state/types';
import { Action, Dispatch, MiddlewareAPI } from 'redux';

export type ActionInterceptor<NodeType, EdgeType> =
  (action: Action, dispatch: Dispatch<Action>, getState: () => DiagramMakerData<NodeType, EdgeType>) => void;

export function createInterceptorMiddleware<NodeType, EdgeType>(
  actionInterceptor?: ActionInterceptor<NodeType, EdgeType>,
) {
  return (store: MiddlewareAPI) => (next: Dispatch<Action>) => (action: Action) => {
    if (!actionInterceptor) {
      next(action);
      return;
    }

    actionInterceptor(action, next, store.getState);
  };
}
