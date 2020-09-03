import * as classnames from 'classnames';
import * as Preact from 'preact';

import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position } from 'diagramMaker/state/types';

import './Connector.scss';

export enum ConnectorType {
  INPUT,
  OUTPUT
}

export interface ConnectorProps {
  id: string;
  position: Position;
  type: ConnectorType;
}

export default class Connector extends Preact.Component<ConnectorProps, {}> {
  public render(): JSX.Element {
    const { id, position, type } = this.props;
    const { x, y } = position;
    const classes = classnames('dm-connector', {
      'dm-connector-input': type === ConnectorType.INPUT,
      'dm-connector-output': type === ConnectorType.OUTPUT
    });
    const transform = `translate3d(${x}px, ${y}px, 0)`;
    const interactionProps: { [index: string]: string | boolean } = {
      'data-id': id, 'data-type': DiagramMakerComponentsType.NODE_CONNECTOR
    };
    if (type === ConnectorType.INPUT) {
      interactionProps['data-dropzone'] = true;
    } else {
      interactionProps['data-draggable'] = true;
    }

    return (
      <div
        className={classes}
        style={{ transform }}
        {...interactionProps}
      >
        <div className="dm-handle" />
      </div>
    );
  }
}
