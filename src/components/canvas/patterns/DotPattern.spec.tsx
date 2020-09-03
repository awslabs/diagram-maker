import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import DotPattern from './DotPattern';

describe('DotPattern', () => {
  it('renders dot pattern', () => {

    const dotPattern = shallow(
      <DotPattern cellSize={10} radius={1} />
    );

    expect(dotPattern).toMatchSnapshot();
  });
});
