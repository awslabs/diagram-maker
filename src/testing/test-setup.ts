import { EnzymeAdapter, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({ adapter: new Adapter() as EnzymeAdapter });

jest.mock('diagramMaker/state/common/rootReducer');
jest.mock('diagramMaker/state/common/sequenceReducers');
jest.mock('diagramMaker/state/layout/layoutReducer');
