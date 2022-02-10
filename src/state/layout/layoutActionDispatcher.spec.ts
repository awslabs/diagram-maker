import { createLayoutAction } from './layoutActionDispatcher';
import { HierarchicalLayoutConfig, LayoutActionsType, LayoutType } from './layoutActions';

describe('layoutActionDispatcher', () => {
  describe('createLayoutAction', () => {
    it('creates LAYOUT action with provided layout config', () => {
      const config: HierarchicalLayoutConfig = {
        layoutType: LayoutType.HIERARCHICAL,
        fixedNodeIds: ['node1'],
        distanceMin: 50,
      };
      expect(createLayoutAction(config)).toEqual({
        payload: config,
        type: LayoutActionsType.LAYOUT,
      });
    });
  });
});
