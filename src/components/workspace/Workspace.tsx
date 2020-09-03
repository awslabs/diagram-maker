import * as classnames from 'classnames';
import * as Preact from 'preact';

import Canvas from 'diagramMaker/components/canvas/Canvas';
import DotPattern from 'diagramMaker/components/canvas/patterns/DotPattern';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position, Size } from 'diagramMaker/state/types';

import './Workspace.scss';

export interface WorkspaceProps {
  canvasPattern?: JSX.Element;
  className?: string | string[];
  position: Position;
  scale: number;
  canvasSize: Size;
}

export const DEFAULT_CANVAS_PATTERN: JSX.Element = <DotPattern cellSize={10} radius={1} />;

const Workspace = (props: Preact.RenderableProps<WorkspaceProps>): JSX.Element => {
  const className = classnames('dm-workspace', props.className);
  const { height, width } = props.canvasSize;
  const { x, y } = props.position;
  const scale = props.scale;

  const transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

  const canvasPattern = props.canvasPattern || DEFAULT_CANVAS_PATTERN;

  return (
    <div
      className={className}
      style={{ height, width, transform }}
      data-type={DiagramMakerComponentsType.WORKSPACE}
      data-event-target={true}
      data-draggable={true}
      data-dropzone={true}
    >
        <Canvas>
          {canvasPattern}
        </Canvas>
        {props.children}
    </div>
  );
};

export default Workspace;
