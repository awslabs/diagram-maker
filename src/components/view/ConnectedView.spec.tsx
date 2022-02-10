import * as Preact from 'preact';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { getConnectedView } from 'diagramMaker/components/view/ConnectedView';
import createStore from 'diagramMaker/state/createStore';

describe('ConnectedView', () => {
  it('connects View component to redux store', () => {
    const configService: any = { mockConfigService: jest.fn() };
    const ConnectedView = getConnectedView();
    const component = (
      <Provider store={createStore()}>
        <ConnectedView configService={configService} />
      </Provider>
    );
    expect(toJson(shallow(component))).toMatchSnapshot();
  });
});
