import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { Edge, EdgeStyle } from '.';

describe('Edge', () => {

  it('renders the paths using props', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x:0, y:100 }}
        dest={{ x:100, y:0 }}
      />
    );

    expect(edge).toMatchSnapshot();
  });

  it('passes show arrowhead', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x:0, y:100 }}
        dest={{ x:100, y:0 }}
        showArrowhead={true}
      />
    );

    expect(edge).toMatchSnapshot();
  });

  it('renders selected class', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x:0, y:100 }}
        dest={{ x:100, y:0 }}
        selected={true}
      />
    );

    expect(edge).toMatchSnapshot();
  });

  it('renders source & dest types', () => {
    const edge = shallow(
      <Edge
        id="myEdge"
        edgeStyle={EdgeStyle.LEFT_RIGHT_BEZIER}
        src={{ x:0, y:100 }}
        dest={{ x:100, y:0 }}
        srcTypeId="sourceType"
        destTypeId="destinationType"
      />
    );

    expect(edge).toMatchSnapshot();
  });

});
