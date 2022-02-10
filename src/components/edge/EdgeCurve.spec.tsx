import * as Preact from 'preact';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import EdgeCurve, { EdgeStyle } from './EdgeCurve';

describe('getCurve', () => {
  describe('left/right placement', () => {
    it('renders at given points with x1 < x2, y1 > y2', () => {
      const src = { x: 0, y: 100 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.LEFT_RIGHT_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with x1 < x2, y1 < y2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 100, y: 100 };
      const edgeStyle = EdgeStyle.LEFT_RIGHT_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with y1 = y2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.LEFT_RIGHT_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with x1 = x2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 0, y: 100 };
      const edgeStyle = EdgeStyle.LEFT_RIGHT_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });
  });

  describe('top/bottom placement', () => {
    it('renders at given points with x1 < x2, y1 > y2', () => {
      const src = { x: 0, y: 100 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.TOP_BOTTOM_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with x1 < x2, y1 < y2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 100, y: 100 };
      const edgeStyle = EdgeStyle.TOP_BOTTOM_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with y1 = y2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.TOP_BOTTOM_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with x1 = x2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 0, y: 100 };
      const edgeStyle = EdgeStyle.TOP_BOTTOM_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });
  });

  describe('straight curve', () => {
    it('renders at given points', () => {
      const src = { x: 0, y: 100 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.STRAIGHT;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });
  });

  describe('arrowhead marker', () => {
    it('renders when show arrowhead is passed', () => {
      const src = { x: 0, y: 100 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.STRAIGHT;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
          showArrowhead
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });
  });

  describe('quadratic bezier', () => {
    it('renders at given points with x1 < x2, y1 > y2', () => {
      const src = { x: 0, y: 100 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.QUADRATIC_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with x1 < x2, y1 < y2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 100, y: 100 };
      const edgeStyle = EdgeStyle.QUADRATIC_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with y1 = y2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 100, y: 0 };
      const edgeStyle = EdgeStyle.QUADRATIC_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });

    it('renders at given points with x1 = x2', () => {
      const src = { x: 0, y: 0 };
      const dest = { x: 0, y: 100 };
      const edgeStyle = EdgeStyle.QUADRATIC_BEZIER;
      const edgeCurve = shallow(
        <EdgeCurve
          src={src}
          dest={dest}
          edgeStyle={edgeStyle}
        />,
      );

      expect(toJson(edgeCurve)).toMatchSnapshot();
    });
  });
});
