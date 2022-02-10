import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import GridPattern from './GridPattern';

describe('GridPattern', () => {
  it('renders grid pattern', () => {
    const gridPattern = shallow(
      <GridPattern cellSize={10} patternSize={100} />,
    );

    expect(toJson(gridPattern)).toMatchSnapshot();
  });
});
