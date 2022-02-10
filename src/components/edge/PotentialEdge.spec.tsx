import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { EdgeStyle } from './EdgeCurve';
import PotentialEdge from './PotentialEdge';

describe('PotentialEdge', () => {
  it('renders the paths using props', () => {
    const edge = shallow(
      <PotentialEdge
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x: 0, y: 100 }}
        dest={{ x: 100, y: 0 }}
      />,
    );

    expect(toJson(edge)).toMatchSnapshot();
  });

  it('passes show arrowhead', () => {
    const edge = shallow(
      <PotentialEdge
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x: 0, y: 100 }}
        dest={{ x: 100, y: 0 }}
        showArrowhead
      />,
    );

    expect(toJson(edge)).toMatchSnapshot();
  });
});
