import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { Connector, ConnectorType } from 'diagramMaker/components/connector';

describe('Connector', () => {
  it('renders at the given position with output data attributes', () => {
    const connector = shallow(
      <Connector
        id="test"
        position={{ x:150, y:300 }}
        type={ConnectorType.OUTPUT}
      />
    );

    expect(connector).toMatchSnapshot();
  });

  it('renders at the given position with input data attributes', () => {
    const connector = shallow(
      <Connector
        id="test"
        position={{ x:150, y:300 }}
        type={ConnectorType.INPUT}
      />
    );

    expect(connector).toMatchSnapshot();
  });
});
