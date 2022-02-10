import { LayoutAction, LayoutActionsType, LayoutConfig } from './layoutActions';

export function createLayoutAction(layoutConfig: LayoutConfig): LayoutAction {
  return {
    type: LayoutActionsType.LAYOUT,
    payload: layoutConfig,
  };
}
