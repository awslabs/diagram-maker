import { AnyAction, Reducer } from 'redux';

/**
 * Combine multiple reducers into one that will pipe `state` through the provided reducers one-by-one,
 * passing the result of the previous reducer as an input of the next one.
 *
 * Allows having `null` or `undefined` reducers in the list. They will be treated as identity function and will
 * pass the state forward without any modifications.
 */
export function sequenceReducers<StateType, ActionType extends AnyAction>(
  rootReducer: Reducer<StateType, ActionType>,
  ...reducers: (Reducer<StateType, ActionType> | undefined | null)[]
): Reducer<StateType, ActionType> {
  return (state: StateType | undefined, action: ActionType) => {
    let intermediateState = rootReducer(state, action);
    reducers.forEach((reducer) => {
      if (reducer) {
        intermediateState = reducer(intermediateState, action);
      }
    });
    return intermediateState;
  };
}
