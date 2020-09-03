import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { SelectionMarquee } from '.';

describe('SelectionMarquee', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders at the given position and size', () => {
    const selectionMarquee = shallow(
      <SelectionMarquee
        anchor={{ x: 200, y: 100 }}
        position={{ x: 800, y: 500 }}
      />
    );

    expect(selectionMarquee).toMatchSnapshot();
  });
});
