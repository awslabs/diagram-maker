import { Action, AnyAction, Middleware } from 'redux';

export declare function undoHistoryReducer<ActionType extends Action>(
  state: UndoHistoryState<ActionType> | undefined, action: AnyAction
): UndoHistoryState<ActionType>;

export type ActionsQueue<ActionType extends Action> = ActionType[];

export interface UndoHistoryState<ActionType extends Action> {
  readonly undoQueue: ActionsQueue<ActionType>;
  readonly redoQueue: ActionsQueue<ActionType>;
}

interface UndoActions {
  undo: () => AnyAction;
  redo: () => AnyAction;
}

export declare const actions: UndoActions;

export type RevertingActionsFunction = (action: any, args?: any) => any;

export interface RevertingActionsObject<StateType> {
  action: RevertingActionsFunction;
  createArgs: (state: StateType, action: any) => any;
}

export type RevertingActions<StateType> = RevertingActionsFunction | RevertingActionsObject<StateType>;

export interface UndoMiddlewareConfig<StateType> {
  revertingActions: {
    [actionType: string]: RevertingActions<StateType>;
  }
}

export declare function createUndoMiddleware<StateType>(config: UndoMiddlewareConfig<StateType>): Middleware;
