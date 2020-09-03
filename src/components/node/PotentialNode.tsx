import * as Preact from 'preact';

import { ComposeView } from 'diagramMaker/components/common';
import { BoundRenderCallback, DestroyCallback } from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position, Size } from 'diagramMaker/state/types';

import './Node.scss';

export interface PotentialNodeProps {
  typeId: string;
  position: Position;
  size: Size;
  renderCallback: BoundRenderCallback;
  destroyCallback: DestroyCallback;
}

export default class PotentialNode extends Preact.Component<PotentialNodeProps, {}> {

  public render(): JSX.Element {
    const { typeId, position, renderCallback, destroyCallback, size } = this.props;
    const { x, y } = position;
    const { width, height } = size;
    const transform = `translate3d(${x}px, ${y}px, 0)`;

    return (
      <div
        className="dm-potential-node"
        style={{ width, height, transform }}
        data-id={typeId}
        data-type={DiagramMakerComponentsType.POTENTIAL_NODE}
        data-event-target={true}
      >
        <ComposeView
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />
      </div>
    );
  }
}
