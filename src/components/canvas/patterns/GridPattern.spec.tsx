import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import GridPattern from './GridPattern';

describe('GridPattern', () => {
  it('renders grid pattern', () => {

    const gridPattern = shallow(
      <GridPattern cellSize={10} patternSize={100}/>
    );

    expect(gridPattern).toMatchSnapshot();
  });
});
