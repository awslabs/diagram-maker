import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { Edge, EdgeStyle } from '.';

describe('Edge', () => {
  it('renders the paths using props', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x: 0, y: 100 }}
        dest={{ x: 100, y: 0 }}
      />,
    );

    expect(toJson(edge)).toMatchSnapshot();
  });

  it('passes show arrowhead', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x: 0, y: 100 }}
        dest={{ x: 100, y: 0 }}
        showArrowhead
      />,
    );

    expect(toJson(edge)).toMatchSnapshot();
  });

  it('renders selected class', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x: 0, y: 100 }}
        dest={{ x: 100, y: 0 }}
        selected
      />,
    );

    expect(toJson(edge)).toMatchSnapshot();
  });

  it('renders source & dest types', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x: 0, y: 100 }}
        dest={{ x: 100, y: 0 }}
        srcTypeId="sourceType"
        destTypeId="destinationType"
      />,
    );

    expect(toJson(edge)).toMatchSnapshot();
  });
});
