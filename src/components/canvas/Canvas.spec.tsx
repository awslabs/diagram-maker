import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { Canvas } from 'diagramMaker/components/canvas';
import { DotPattern, GridPattern } from 'diagramMaker/components/canvas/patterns';

describe('Canvas', () => {
  it('renders canvas given dot pattern', () => {
    const dotPattern = <DotPattern cellSize={10} radius={1} />;

    const canvas = shallow(
      <Canvas>
        {dotPattern}
      </Canvas>,
    );

    expect(toJson(canvas)).toMatchSnapshot();
  });

  it('renders canvas given grid pattern', () => {
    const gridPattern = <GridPattern cellSize={10} patternSize={100} />;

    const canvas = shallow(
      <Canvas>
        {gridPattern}
      </Canvas>,
    );

    expect(toJson(canvas)).toMatchSnapshot();
  });
});
