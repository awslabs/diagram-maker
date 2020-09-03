import { DiagramMakerPlugins } from 'diagramMaker/state/types';

import pluginReducer from './pluginReducer';

describe('pluginReducer', () => {

  const getState1 = (testScale = 1): DiagramMakerPlugins => ({

  });

  const getState2 = (): DiagramMakerPlugins => ({
    [`minimap`]: {
      data:{
        size: { width: 200, height: 240 }
      }
    }
  });

  it('initializes plugins data when no plugins data exists', () => {
    const action: any = { type: 'randomAction' };
    expect(pluginReducer(undefined, action)).toEqual(getState1());
  });

  it('does not change existing plugins state data', () => {
    const action: any = { type: 'randomAction' };
    expect(pluginReducer(getState2(), action)).toEqual(getState2());
  });

});
