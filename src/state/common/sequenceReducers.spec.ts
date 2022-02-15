import { Reducer } from 'redux';

import { sequenceReducers } from './sequenceReducers';

jest.unmock('./sequenceReducers');

interface State {
  num: number;
  str: string;
}

enum ActionType {
  NUM_ACTION = 'NUM_ACTION',
  STR_ACTION = 'STR_ACTION',
}

interface NumAction {
  type: ActionType.NUM_ACTION;
  payload: number;
}

interface StrAction {
  type: ActionType.STR_ACTION;
  payload: string;
}

type Action = NumAction | StrAction;

describe('sequenceReducers', () => {
  function initState(): State {
    return { num: 123, str: 'hello' };
  }

  function createIncReducer(): Reducer<State, Action> {
    return (state: State | undefined, action: Action) => {
      if (!state) {
        return initState();
      }
      if (action.type === ActionType.NUM_ACTION) {
        return {
          num: state.num + action.payload,
          str: state.str,
        };
      }
      return state;
    };
  }

  function createSetStrReducer(): Reducer<State, Action> {
    return (state: State | undefined, action: Action) => {
      if (!state) {
        return initState();
      }
      if (action.type === ActionType.STR_ACTION) {
        return {
          num: state.num,
          str: action.payload,
        };
      }
      return state;
    };
  }

  it('returns a combined reducer, that sequences state through provided reducers', () => {
    const reducer = sequenceReducers(
      createIncReducer(),
      createSetStrReducer(),
      createIncReducer(),
    );

    // Increment by 0 should result in the same state
    expect(reducer(undefined, { type: ActionType.NUM_ACTION, payload: 0 }))
      .toEqual(initState());

    // We have 2 increment reducers, so payload is added twice
    expect(reducer({ num: 12, str: 'hi' }, { type: ActionType.NUM_ACTION, payload: 34 }))
      .toEqual({ num: 80, str: 'hi' });

    // SetStrReducer is also there in the middle
    expect(reducer({ num: 12, str: 'hi' }, { type: ActionType.STR_ACTION, payload: 'bye' }))
      .toEqual({ num: 12, str: 'bye' });
  });

  it('allows having `null` and `undefined` reducers in the list', () => {
    const reducer = sequenceReducers(
      createSetStrReducer(),
      null,
      undefined,
      null,
    );

    // SetStrReducer is there and should process STR_ACTION
    expect(reducer({ num: 1, str: 'hi' }, { type: ActionType.STR_ACTION, payload: 'hello' }))
      .toEqual({ num: 1, str: 'hello' });

    // IncReducer is not there and so NUM_ACTION is ignored
    expect(reducer({ num: 5, str: 'yo' }, { type: ActionType.NUM_ACTION, payload: 123 }))
      .toEqual({ num: 5, str: 'yo' });
  });

  it('does not modify the state, as long as reducers do not modify it', () => {
    const reducer = sequenceReducers(createIncReducer(), null, createSetStrReducer());
    const state = { num: 1, str: 'abc' };
    const updatedState = reducer(state, { type: ActionType.STR_ACTION, payload: 'def' });

    expect(updatedState).toEqual({ num: 1, str: 'def' });
    expect(state).toEqual({ num: 1, str: 'abc' });
  });
});
