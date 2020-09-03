import {
  ConnectorPlacement, DiagramMaker, VisibleConnectorTypes
} from 'diagramMaker/index';
import { ContextMenuRenderCallbacks } from 'diagramMaker/service/ConfigService';
import { DiagramMakerData, DiagramMakerNode, DiagramMakerPotentialNode } from 'diagramMaker/state/types';
import 'preact/devtools';
import { Action, Dispatch } from 'redux';

import { graph } from './data';

import '../scss/CircularNode.scss';
import '../scss/Logger.scss';
import '../scss/RectangularNode.scss';

import {
  addDevTools, createCircularNode, createEdgeContextMenu, createLibraryPanel, createNodeContextMenu,
  createNodeWithDropdown, createNodeWithInput, createPanelContextMenu, createPotentialNode, createRectangularNode,
  createToolsPanel, createWorkspaceContextMenu, updateActionInLogger
} from '../utils';

const windowAsAny = window as any;

export function renderDiagramMaker() {
  windowAsAny.diagramMaker = new DiagramMaker(
    'diagramMakerContainer', {
      options: {
        connectorPlacement: ConnectorPlacement.LEFT_RIGHT
      },
      renderCallbacks: {
        destroy: () => undefined,
        node: (node: DiagramMakerNode<{}>, container: HTMLElement) => {
          if (node.typeId === 'testId-centered') {
            return createCircularNode(node, container);
          }
          if (node.typeId === 'testId-input') {
            return createNodeWithInput(node, container);
          }
          if (node.typeId === 'testId-dropdown') {
            return createNodeWithDropdown(node, container);
          }
          return createRectangularNode(node, container);
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
        },
        contextMenu: {
          node: (id: string | undefined, container: HTMLElement) => createNodeContextMenu(id, container),
          edge: (id: string | undefined, container: HTMLElement) => createEdgeContextMenu(id, container),
          panel: (id: string | undefined, container: HTMLElement) => createPanelContextMenu(id, container),
          workspace: (container: HTMLElement) => createWorkspaceContextMenu(container)
        } as ContextMenuRenderCallbacks
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
          visibleConnectorTypes: VisibleConnectorTypes.NONE
        },
        'testId-dropdown': {
          size: { width: 150, height: 50 }
        },
        'testId-end': {
          size: { width: 150, height: 50 },
          visibleConnectorTypes: VisibleConnectorTypes.INPUT_ONLY
        },
        'testId-input': {
          size: { width: 150, height: 50 }
        },
        'testId-normal': {
          size: { width: 150, height: 50 }
        },
        'testId-normalWithSize': {
          size: { width: 150, height: 50 }
        },
        'testId-start': {
          size: { width: 150, height: 50 },
          visibleConnectorTypes: VisibleConnectorTypes.OUTPUT_ONLY
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
