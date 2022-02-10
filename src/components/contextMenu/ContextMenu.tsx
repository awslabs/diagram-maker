import * as Preact from 'preact';

import { ComposeView } from 'diagramMaker/components/common';
import { BoundRenderCallback, DestroyCallback } from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position } from 'diagramMaker/state/types';

import './ContextMenu.scss';

export interface ContextMenuProps {
  position: Position;
  renderCallback: BoundRenderCallback;
  destroyCallback: DestroyCallback;
}

export default class ContextMenu extends Preact.Component<ContextMenuProps> {
  public render(): JSX.Element {
    const { x, y } = this.props.position;
    const transform = `translate3d(${x}px, ${y}px, 0)`;
    const { renderCallback, destroyCallback } = this.props;

    return (
      <div
        className="dm-context-menu"
        style={{ transform }}
        data-type={DiagramMakerComponentsType.CONTEXT_MENU}
      >
        <ComposeView
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />
      </div>
    );
  }
}
