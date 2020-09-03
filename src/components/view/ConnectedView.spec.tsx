import * as Preact from 'preact';
import { Provider } from 'preact-redux';
import { shallow } from 'preact-render-spy';

import { getConnectedView } from 'diagramMaker/components/view/ConnectedView';
import createStore from 'diagramMaker/state/createStore';

describe('ConnectedView', () => {
  it('connects View component to redux store', () => {
    const configService: any = { mockConfigService: jest.fn() };
    const ConnectedView = getConnectedView();
    const component = (
      <Provider store={createStore()}>
        <ConnectedView configService={configService}/>
      </Provider>
    );
    expect(shallow(component)).toMatchSnapshot();
  });
});
