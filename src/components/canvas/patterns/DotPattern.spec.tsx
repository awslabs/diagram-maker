import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import DotPattern from './DotPattern';

describe('DotPattern', () => {
  it('renders dot pattern', () => {
    const dotPattern = shallow(
      <DotPattern cellSize={10} radius={1} />,
    );

    expect(toJson(dotPattern)).toMatchSnapshot();
  });
});
