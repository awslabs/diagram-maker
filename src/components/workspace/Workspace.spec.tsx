import * as Preact from 'preact';
import { shallow } from 'preact-render-spy';

import { DotPattern, GridPattern } from 'diagramMaker/components/canvas/patterns';
import { Workspace } from 'diagramMaker/components/workspace';

describe('Workspace', () => {
  it('renders canvas given dot pattern', () => {
    const dotPattern = <DotPattern cellSize={10} radius={1} />;

    const workspace = shallow(
            <Workspace
              className="workspace"
              canvasPattern={dotPattern}
              position={{ x:0, y:0 }}
              canvasSize={{ width:800, height:400 }}
              scale={1}
            />
    );

    expect(workspace).toMatchSnapshot();
  });

  it('renders canvas given grid pattern', () => {
    const gridPattern = <GridPattern cellSize={10} patternSize={100}/>;

    const workspace = shallow(
      <Workspace
        className="workspace"
        canvasPattern={gridPattern}
        position={{ x:0, y:0 }}
        canvasSize={{ width:800, height:400 }}
        scale={1}
      />
    );

    expect(workspace).toMatchSnapshot();
  });

  it('renders dot pattern as default', () => {
    const workspace = shallow(
      <Workspace
        className="workspace"
        position={{ x:0, y:0 }}
        canvasSize={{ width:800, height:400 }}
        scale={1}
      />
    );

    expect(workspace).toMatchSnapshot();
  });

});
