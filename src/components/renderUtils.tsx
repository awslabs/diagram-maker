import * as Preact from 'preact';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { getConnectedView } from 'diagramMaker/components/view/ConnectedView';
import ConfigService from 'diagramMaker/service/ConfigService';
import { DiagramMakerData } from 'diagramMaker/state/types';

export function render<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  container: HTMLElement,
  configService: ConfigService<NodeType, EdgeType>,
) {
  const ConnectedView = getConnectedView();
  return Preact.render(
    <Provider store={store}>
      <ConnectedView configService={configService} />
    </Provider>,
    container,
  );
}

export function destroy(container: HTMLElement) {
  return Preact.render(null, container);
}
