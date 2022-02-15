import ConfigService, {
  ConnectorPlacement, DiagramMakerConfig, Shape, VisibleConnectorTypes,
} from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';

describe('ConfigService', () => {
  const renderDestroy = jest.fn();
  const renderEdge = jest.fn();
  const renderNode = jest.fn();
  const renderEdgeContextMenu = jest.fn();
  const renderNodeContextMenu = jest.fn();
  const renderPanelContextMenu = jest.fn();
  const renderWorkspaceContextMenu = jest.fn();
  const renderTestPanel = jest.fn();
  const renderPotentialNode = jest.fn();
  const actionInterceptor = jest.fn();
  const size = { width: 100, height: 100 };
  const options = {
    connectorPlacement: ConnectorPlacement.LEFT_RIGHT,
    showArrowhead: true,
  };
  const renderCallbacks = {
    contextMenu: {
      edge: renderEdgeContextMenu,
      node: renderNodeContextMenu,
      panel: renderPanelContextMenu,
      workspace: renderWorkspaceContextMenu,
    },
    destroy: renderDestroy,
    edge: renderEdge,
    node: renderNode,
    panels: {
      test: renderTestPanel,
    },
    potentialNode: renderPotentialNode,
  };

  const config: DiagramMakerConfig<void, void> = {
    options,
    renderCallbacks,
    actionInterceptor,
  };
  const configService = new ConfigService(config);

  describe('getRenderNode', () => {
    it('returns renderCallback passed for node', () => {
      expect(configService.getRenderNode()).toBe(renderNode);
    });
  });

  describe('getRenderPotentialNode', () => {
    it('returns renderCallback passed for potential node', () => {
      expect(configService.getRenderPotentialNode()).toBe(renderPotentialNode);
    });
  });

  describe('getRenderEdge', () => {
    it('returns renderCallback passed for edge', () => {
      expect(configService.getRenderEdge()).toBe(renderEdge);
    });
  });

  describe('getRenderPanel', () => {
    it('returns renderCallback passed for provided panel name', () => {
      expect(configService.getRenderPanel('test')).toBe(renderTestPanel);
    });

    it('returns undefined if render callback is not defined for panel name', () => {
      expect(configService.getRenderPanel('randomPanel')).toBeUndefined();
    });
  });

  describe('getRenderDestroy', () => {
    it('returns the destroy callback passed', () => {
      expect(configService.getRenderDestroy()).toBe(renderDestroy);
    });
  });

  describe('getConnectorPlacement', () => {
    it('returns connector placement setting', () => {
      expect(configService.getConnectorPlacement()).toBe(ConnectorPlacement.LEFT_RIGHT);
    });

    it('returns centered if options is not present', () => {
      const configWithoutOptions: any = { renderCallbacks: {} };
      const configServiceWithoutOptions = new ConfigService(configWithoutOptions);
      expect(configServiceWithoutOptions.getConnectorPlacement()).toEqual(ConnectorPlacement.CENTERED);
    });
  });

  describe('getShowArrowhead', () => {
    it('returns show arrowhead setting', () => {
      expect(configService.getShowArrowhead()).toBeTruthy();
    });

    it('returns centered if options is not present', () => {
      const configWithoutOptions: any = { renderCallbacks: {} };
      const configServiceWithoutOptions = new ConfigService(configWithoutOptions);
      expect(configServiceWithoutOptions.getShowArrowhead()).toBeFalsy();
    });
  });

  describe('getBoundRenderContextMenu', () => {
    it('returns node context menu render callback bound to id for DiagramMaker.Node', () => {
      const id = 'testId';
      const boundCallback = configService.getBoundRenderContextMenu(DiagramMakerComponentsType.NODE, id) as any;
      boundCallback();
      expect(renderNodeContextMenu).toHaveBeenCalledWith(id);
      expect(renderNodeContextMenu).toHaveBeenCalledTimes(1);
    });

    it('returns edge context menu render callback bound to id for DiagramMaker.Edge', () => {
      const id = 'testId';
      const boundCallback = configService.getBoundRenderContextMenu(DiagramMakerComponentsType.EDGE, id) as any;
      boundCallback();
      expect(renderEdgeContextMenu).toHaveBeenCalledWith(id);
      expect(renderEdgeContextMenu).toHaveBeenCalledTimes(1);
    });

    it('returns panel context menu render callback bound to id for DiagramMaker.Panel', () => {
      const id = 'testId';
      const boundCallback = configService.getBoundRenderContextMenu(DiagramMakerComponentsType.PANEL, id) as any;
      boundCallback();
      expect(renderPanelContextMenu).toHaveBeenCalledWith(id);
      expect(renderPanelContextMenu).toHaveBeenCalledTimes(1);
    });

    it('returns workspace context menu render callback for DiagramMaker.Workspace', () => {
      const boundCallback = configService.getBoundRenderContextMenu(DiagramMakerComponentsType.WORKSPACE) as any;
      boundCallback();
      expect(renderWorkspaceContextMenu).toHaveBeenCalledTimes(1);
    });

    it('returns undefined when contextMenu is not defined', () => {
      const configWithoutContextMenu: any = { renderCallbacks: {} };
      const configServiceWithoutContextMenu = new ConfigService(configWithoutContextMenu);
      const boundCallback = configServiceWithoutContextMenu
        .getBoundRenderContextMenu(DiagramMakerComponentsType.WORKSPACE) as any;
      expect(boundCallback).toBeUndefined();
    });
  });

  describe('getActionInterceptor', () => {
    it('returns actionInterceptor if it is specified in config', () => {
      expect(configService.getActionInterceptor()).toBe(actionInterceptor);
    });

    it('returns undefined if no actionInterceptor is defined in config', () => {
      const configWithoutActionInterceptor: any = { renderCallbacks: {} };
      const configServiceWithoutActionInterceptor = new ConfigService(configWithoutActionInterceptor);

      expect(configServiceWithoutActionInterceptor.getActionInterceptor()).toBe(undefined);
    });
  });

  describe('getSizeForNodeType', () => {
    it('returns size if it is specified in node type config', () => {
      const type = 'mockNodeType';
      const configWithTypeConfig: DiagramMakerConfig<void, void> = {
        renderCallbacks,
        nodeTypeConfig: {
          [type]: { size },
        },
      };
      const configServiceWithTypeConfig = new ConfigService(configWithTypeConfig);
      expect(configServiceWithTypeConfig.getSizeForNodeType(type)).toBe(size);
    });

    it('returns undefined if no type config is defined in config', () => {
      const type = 'mockNodeType';
      expect(configService.getSizeForNodeType(type)).toBeUndefined();
    });
  });

  describe('getConnectorPlacementForNodeType', () => {
    it('returns connector placement if it is specified in node type config', () => {
      const type = 'mockNodeType';
      const connectorPlacementOverride = ConnectorPlacement.LEFT_RIGHT;
      const configWithTypeConfig: DiagramMakerConfig<void, void> = {
        renderCallbacks,
        nodeTypeConfig: {
          [type]: { size, connectorPlacementOverride },
        },
      };
      const configServiceWithTypeConfig = new ConfigService(configWithTypeConfig);
      expect(configServiceWithTypeConfig.getConnectorPlacementForNodeType(type)).toBe(connectorPlacementOverride);
    });

    it('returns default value if connector placement is not specified in node type config', () => {
      const type = 'mockNodeType';
      const configWithTypeConfig: DiagramMakerConfig<void, void> = {
        renderCallbacks,
        nodeTypeConfig: {
          [type]: { size },
        },
      };
      const configServiceWithTypeConfig = new ConfigService(configWithTypeConfig);
      expect(configServiceWithTypeConfig.getConnectorPlacementForNodeType(type))
        .toBe(configServiceWithTypeConfig.getConnectorPlacement());
    });

    it('returns default value if no type config is defined in config', () => {
      const type = 'mockNodeType';
      expect(configService.getConnectorPlacementForNodeType(type)).toBe(configService.getConnectorPlacement());
    });
  });

  describe('getShapeForNodeType', () => {
    it('returns shape if it is specified in node type config', () => {
      const type = 'mockNodeType';
      const shape = Shape.CIRCLE;
      const configWithTypeConfig: DiagramMakerConfig<void, void> = {
        renderCallbacks,
        nodeTypeConfig: {
          [type]: { size, shape },
        },
      };
      const configServiceWithTypeConfig = new ConfigService(configWithTypeConfig);
      expect(configServiceWithTypeConfig.getShapeForNodeType(type)).toBe(shape);
    });

    it('returns undefined if it is not specified in node type config', () => {
      const type = 'mockNodeType';
      const configWithTypeConfig: DiagramMakerConfig<void, void> = {
        renderCallbacks,
        nodeTypeConfig: {
          [type]: { size },
        },
      };
      const configServiceWithTypeConfig = new ConfigService(configWithTypeConfig);
      expect(configServiceWithTypeConfig.getShapeForNodeType(type)).toBeUndefined();
    });

    it('returns undefined if no type config is defined in config', () => {
      const type = 'mockNodeType';
      expect(configService.getShapeForNodeType(type)).toBeUndefined();
    });
  });

  describe('getVisibleConnectorTypesForNodeType', () => {
    it('returns visible connector config if it is specified in node type config', () => {
      const type = 'mockNodeType';
      const visibleConnectorTypes = VisibleConnectorTypes.INPUT_ONLY;
      const configWithTypeConfig: DiagramMakerConfig<void, void> = {
        renderCallbacks,
        nodeTypeConfig: {
          [type]: { size, visibleConnectorTypes },
        },
      };
      const configServiceWithTypeConfig = new ConfigService(configWithTypeConfig);
      expect(configServiceWithTypeConfig.getVisibleConnectorTypesForNodeType(type)).toBe(visibleConnectorTypes);
    });

    it('returns undefined if it is not specified in node type config', () => {
      const type = 'mockNodeType';
      const configWithTypeConfig: DiagramMakerConfig<void, void> = {
        renderCallbacks,
        nodeTypeConfig: {
          [type]: { size },
        },
      };
      const configServiceWithTypeConfig = new ConfigService(configWithTypeConfig);
      expect(configServiceWithTypeConfig.getVisibleConnectorTypesForNodeType(type)).toBeUndefined();
    });

    it('returns undefined if no type config is defined in config', () => {
      const type = 'mockNodeType';
      expect(configService.getVisibleConnectorTypesForNodeType(type)).toBeUndefined();
    });
  });
});
