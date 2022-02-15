import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

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
      />,
    );

    expect(toJson(selectionMarquee)).toMatchSnapshot();
  });
});
