import {
  ConnectorPlacement, DiagramMaker, DiagramMakerAction, DiagramMakerActions, VisibleConnectorTypes
} from 'diagramMaker/index';
import { CreateEdgeAction } from 'diagramMaker/state/edge/edgeActions';
import { DiagramMakerData, DiagramMakerNode, DiagramMakerPotentialNode } from 'diagramMaker/state/types';
import 'preact/devtools';
import { Action, Dispatch } from 'redux';

import { graph } from './data';

import '../scss/CircularNode.scss';
import '../scss/Logger.scss';
import '../scss/RectangularNode.scss';

import {
  addDevTools, createCircularNode, createLibraryPanel, createPotentialNode,
  createRectangularNode, createToolsPanel, updateActionInLogger
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
        }
      },
      actionInterceptor: (action: Action, dispatch: Dispatch<Action>, getState: () => DiagramMakerData<{}, {}>) => {
        const diagramMakerAction = action as DiagramMakerAction<{ odd: boolean }, {}>;
        updateActionInLogger(action);
        if (diagramMakerAction.type === DiagramMakerActions.DELETE_ITEMS &&
            diagramMakerAction.payload.nodeIds.length > 0) {
          return;
        }

        if (diagramMakerAction.type === DiagramMakerActions.NODE_CREATE) {
          // nodes before are even so this odd
          diagramMakerAction.payload.consumerData = {
            odd: Object.keys(getState().nodes).length % 2 === 0
          };
          dispatch(diagramMakerAction);
          return;
        }

        if (diagramMakerAction.type === DiagramMakerActions.EDGE_CREATE) {
          dispatch(diagramMakerAction);
          const newAction: CreateEdgeAction<{}> = {
            type: DiagramMakerActions.EDGE_CREATE,
            payload: {
              id: `${diagramMakerAction.payload.id}-2`,
              src: diagramMakerAction.payload.dest,
              dest: diagramMakerAction.payload.src
            }
          };
          setTimeout(() => dispatch(newAction), 1000);
        }

        dispatch(action);
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
        'testId-end': {
          size: { width: 150, height: 50 },
          visibleConnectorTypes: VisibleConnectorTypes.INPUT_ONLY
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
