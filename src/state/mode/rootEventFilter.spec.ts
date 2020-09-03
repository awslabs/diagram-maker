jest.mock('./readOnly/readOnlyEventFilter', () => ({ default: jest.fn() }));

import { NormalizedEvent } from 'diagramMaker/service/ui/UIEventNormalizer';
import { EditorMode } from 'diagramMaker/state/types';

import { rootEventFilter } from '.';

import readOnlyEventFilter from './readOnly/readOnlyEventFilter';

describe('rootEventFilter', () => {

  beforeEach(() => jest.clearAllMocks());

  it('applies readOnlyEventFilter if the editor mode is READ_ONLY', () => {
    const event = {};

    rootEventFilter(event as NormalizedEvent, EditorMode.READ_ONLY);

    expect(readOnlyEventFilter).toHaveBeenCalledTimes(1);
    expect(readOnlyEventFilter).toHaveBeenCalledWith(event);
  });

  it('returns true without calling anything if the editor mode is not READ_ONLY', () => {
    const event = {};

    const result = rootEventFilter(event as NormalizedEvent, EditorMode.DRAG);

    expect(readOnlyEventFilter).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
