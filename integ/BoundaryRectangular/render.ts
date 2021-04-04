import {
  ConnectorPlacement, DiagramMaker, Shape, VisibleConnectorTypes
} from 'diagramMaker/index';
import {
  DiagramMakerData, DiagramMakerEdge, DiagramMakerNode, DiagramMakerPotentialNode
} from 'diagramMaker/state/types';
import 'preact/devtools';
import { Action, Dispatch } from 'redux';

import { graph } from './data';

import '../scss/CircularNode.scss';
import '../scss/Logger.scss';
import '../scss/RectangularNode.scss';

import {
  addDevTools, createCircularNode, createLibraryPanel,
  createPotentialNode, createRectangularConnectorNode, createToolsPanel, updateActionInLogger
} from '../utils';

const windowAsAny = window as any;

export function renderDiagramMaker() {
  windowAsAny.diagramMaker = new DiagramMaker(
    'diagramMakerContainer',
    {
      options: {
        connectorPlacement: ConnectorPlacement.BOUNDARY,
        showArrowhead: true
      },
      renderCallbacks: {
        destroy: () => undefined,
        edge: (edge: DiagramMakerEdge<{}>, container: HTMLElement): HTMLElement | undefined => {
          if (container.innerHTML === '') {
            const element = document.createElement('div');
            element.textContent = edge.id.substring(0, 10);
            element.classList.add('edgeBadge');
            container.appendChild(element);
            return element;
          }
        },
        node: (node: DiagramMakerNode<{}>, container: HTMLElement) => {
          if (node.typeId === 'testId-centered') {
            return createCircularNode(node, container);
          }
          return createRectangularConnectorNode(node, container);
        },
        potentialNode: (node: DiagramMakerPotentialNode, container: HTMLElement) =>
          createPotentialNode(node, container),
        panels: {
          library: (panel: any, state: any, container: HTMLElement) => createLibraryPanel(container),
          tools: (
            panel: any,
            state: any,
            container: HTMLElement
          ) => createToolsPanel(container, () => windowAsAny.diagramMaker)
        }
      },
      actionInterceptor: (action: Action, next: Dispatch<Action>, getState: () => DiagramMakerData<{}, {}>) => {
        updateActionInLogger(action);
        next(action);
      },
      nodeTypeConfig: {
        'testId-centered': {
          size: { width: 100, height: 100 },
          connectorPlacementOverride: ConnectorPlacement.CENTERED
        },
        'testId-dead': {
          size: { width: 150, height: 50 },
          visibleConnectorTypes: VisibleConnectorTypes.NONE,
          connectorPlacementOverride: ConnectorPlacement.LEFT_RIGHT
        },
        'testId-end': {
          size: { width: 150, height: 50 },
          visibleConnectorTypes: VisibleConnectorTypes.INPUT_ONLY,
          connectorPlacementOverride: ConnectorPlacement.LEFT_RIGHT
        },
        'testId-normal': {
          size: { width: 200, height: 100 },
          connectorPlacementOverride: ConnectorPlacement.BOUNDARY,
          shape: Shape.RECTANGLE
        },
        'testId-normalWithSize': {
          size: { width: 300, height: 50 },
          connectorPlacementOverride: ConnectorPlacement.BOUNDARY,
          shape: Shape.RECTANGLE
        },
        'testId-start': {
          size: { width: 150, height: 50 },
          visibleConnectorTypes: VisibleConnectorTypes.OUTPUT_ONLY,
          connectorPlacementOverride: ConnectorPlacement.LEFT_RIGHT
        },
        'testId-topBottom': {
          size: { width: 150, height: 50 },
          connectorPlacementOverride: ConnectorPlacement.TOP_BOTTOM
        }
      }
    },
    {
      consumerEnhancer: addDevTools(),
      initialData: graph
    }
  );
}
