import * as Preact from 'preact';
import { Provider } from 'preact-redux';
import { Store } from 'redux';

import { getConnectedView } from 'diagramMaker/components/view/ConnectedView';
import ConfigService from 'diagramMaker/service/ConfigService';
import { DiagramMakerData } from 'diagramMaker/state/types';

export function render<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  container: HTMLElement,
  configService: ConfigService<NodeType, EdgeType>,
  root?: Element
) {
  const ConnectedView = getConnectedView<NodeType, EdgeType>();
  return Preact.render(
    <Provider store={store}>
      <ConnectedView configService={configService} />
    </Provider>,
    container, root
  );
}

export function destroy(container: HTMLElement, root: Element) {
  return Preact.render(null, container, root);
}
