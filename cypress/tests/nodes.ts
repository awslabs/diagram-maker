import {
  getAllNodes, getDiagramMakerView, getEdgeById, getNodeById, getPanelById, getPotentialNodeById, getWorkspace
} from '../common/getters';
import {
  clickElement, dragAndDropElement, dragElement, dragStartElement, dropElement, triggerKeyboardEvent
} from '../common/interaction';
import { convertTranslate2dToMatrix } from '../common/utils';

describe('DiagramMaker.Nodes', () => {

  const nodeRect = { width: 100, height: 50 };

  beforeEach(() => {
    cy.visit('/LeftRightRectangular.html');
  });

  describe('node rendering', () => {
    it('renders node', () => {
      const node = getNodeById('node1');
      node.should('have.length', 1);
      node.should('have.class', 'dm-node');
      node.children().should('have.class', 'dm-content');
    });

    it('renders input connector', () => {
      const expectedTransform = convertTranslate2dToMatrix(0, 25);
      const node = getNodeById('node1');
      const inputConnector = node.children('.dm-connector-input');
      inputConnector.should('have.length', 1);
      inputConnector.should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('renders output connector', () => {
      const expectedTransform = convertTranslate2dToMatrix(100, 25);
      const node = getNodeById('node1');
      const inputConnector = node.children('.dm-connector-output');
      inputConnector.should('have.length', 1);
      inputConnector.should('have.css', 'transform').and('eq', expectedTransform);
    });
  });

  describe('move node', () => {
    it('moves node when user drags', () => {
      const centerX = 500;
      const centerY = 500;
      const topLeftX = centerX - nodeRect.width / 2;
      const topLeftY = centerY - nodeRect.height / 2;
      const expectedTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
      const node = getNodeById('node1');
      dragStartElement(node, { pageX: centerX, pageY: centerY });
      node.should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('moves node to workspace top left boundary', () => {
      const centerX = -100;
      const centerY = -100;
      const topLeftX = centerX - nodeRect.width / 2;
      const topLeftY = centerY - nodeRect.height / 2;
      const offsetX = - topLeftX;
      const offsetY = - topLeftY;
      const expectedX = topLeftX + offsetX;
      const expectedY = topLeftY + offsetY;
      const expectedTransform = convertTranslate2dToMatrix(expectedX, expectedY);
      const node = getNodeById('node1');
      dragStartElement(node, { pageX: centerX, pageY: centerY });
      node.should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('moves node to workspace bottom right boundary', () => {
      const centerX = 4000;
      const centerY = 2000;
      const topLeftX = centerX - nodeRect.width / 2;
      const topLeftY = centerY - nodeRect.height / 2;
      const expectedX = topLeftX;
      const expectedY = topLeftY;
      const expectedTransform = convertTranslate2dToMatrix(expectedX, expectedY);
      const node = getNodeById('node1');
      dragStartElement(node, { pageX: centerX, pageY: centerY });
      node.should('have.css', 'transform').and('eq', expectedTransform);
    });

    it('moves node when user drags & drops', () => {
      const centerX = 500;
      const centerY = 500;
      const topLeftX = centerX - nodeRect.width / 2;
      const topLeftY = centerY - nodeRect.height / 2;
      const expectedTransform = convertTranslate2dToMatrix(topLeftX, topLeftY);
      const node = getNodeById('node1');

      dragAndDropElement(node, { pageX: centerX, pageY: centerY });
      node.should('have.css', 'transform').and('eq', expectedTransform);
    });
  });

  describe('select node', () => {
    it('adds selected class to node when selected', () => {
      const node = getNodeById('node1');
      clickElement(node);
      const childElement = node.children('.dm-content').children();
      childElement.should('have.class', 'selected');
    });

    it('deselects previously selected nodes', () => {
      const node1 = getNodeById('node1');
      clickElement(node1);
      const childElement1 = node1.children('.dm-content').children();
      childElement1.should('have.class', 'selected');
      const node2 = getNodeById('node2');
      clickElement(node2);
      const childElement2 = node2.children('.dm-content').children();
      childElement2.should('have.class', 'selected');
      getNodeById('node1').children('.dm-content').children().should('not.have.class', 'selected');
    });

    it('deselects selected edges', () => {
      const edge = getEdgeById('edge1');
      clickElement(edge);
      edge.should('have.class', 'dm-selected');
      const node = getNodeById('node1');
      clickElement(node);
      const childElement = node.children('.dm-content').children();
      childElement.should('have.class', 'selected');
      getEdgeById('edge1').should('not.have.class', 'dm-selected');
    });
  });

  describe('delete node', () => {
    function selectNodeAndKeyboardEvent(keyboardEvent: string, nodeId: string = 'node1'): Cypress.Chainable {
      const node = getNodeById(nodeId);
      clickElement(node);
      triggerKeyboardEvent(getDiagramMakerView(), keyboardEvent);
      return node;
    }
    it('deletes selected node when Backspace is pressed', () => {
      selectNodeAndKeyboardEvent('Backspace');
      getNodeById('node1').should('not.exist');
    });

    it('deletes selected node when Delete is pressed', () => {
      selectNodeAndKeyboardEvent('Delete');
      getNodeById('node1').should('not.exist');
    });

    it('does not delete selected node when A key is pressed', () => {
      selectNodeAndKeyboardEvent('A');
      getNodeById('node1').should('exist');
    });

    it('deletes edges coming out of the node when Backspace is pressed', () => {
      getEdgeById('edge1').should('exist');
      selectNodeAndKeyboardEvent('Backspace');
      getNodeById('node1').should('not.exist');
      getEdgeById('edge1').should('not.exist');
    });

    it('deletes edges coming in to the node when Backspace is pressed', () => {
      getEdgeById('edge1').should('exist');
      selectNodeAndKeyboardEvent('Backspace', 'node2');
      getNodeById('node2').should('not.exist');
      getEdgeById('edge1').should('not.exist');
    });
  });

  describe('potential node', () => {
    beforeEach(() => {
      const node = getPotentialNodeById('testId-normal');
      dragStartElement(node, { pageX: 0, pageY: 0 });
    });

    it('renders a potential node when user drags on the node preview', () => {
      getAllNodes().should('have.length', 2);
      cy.get('.dm-interim .dm-potential-node').should('exist');
    });

    it('creates a new node when potential node is dropped on the workspace', () => {
      getAllNodes().should('have.length', 2);
      dropElement(getPotentialNodeById('testId-normal').first());
      cy.get('.dm-interim .dm-potential-node').should('not.exist');
      getAllNodes().should('have.length', 3);
    });

    it('doesnt create a new node when potential node is dropped on the panel', () => {
      getAllNodes().should('have.length', 2);
      getPanelById('library').then((el) => {
        const rect = el[0].getBoundingClientRect();
        const pageX = rect.left + rect.width / 2;
        const pageY = rect.top + rect.height / 2;
        dragElement(getPotentialNodeById('testId-normal').first(), { pageX, pageY });
        dropElement(getPotentialNodeById('testId-normal').first());
        cy.get('.dm-interim .dm-potential-node').should('not.exist');
        getAllNodes().should('have.length', 2);
      });
    });
  });

  describe('node with input', () => {
    const initialNodeIds: string[] = [];
    beforeEach(() => {
      getAllNodes().each($el => initialNodeIds.push($el.data('id')));

      const inputNode = getPotentialNodeById('testId-input');
      dragAndDropElement(inputNode, { pageX: 300, pageY: 400 });
    });

    it('pressing delete within the text doesnt delete selected nodes', () => {
      getAllNodes().each(($el) => {
        const dataId = $el.data('id');
        if (initialNodeIds.indexOf(dataId) === -1) {
          clickElement(getNodeById('node1'));
          // Enter some text and then press delete
          triggerKeyboardEvent(cy.wrap($el.find('input')), 'abc{backspace}');
          getAllNodes().should('have.length', 3);
          getNodeById('node1').children('.dm-content').children().should('have.class', 'selected');
        }
      });
    });

    it('pressing delete within the text doesnt delete selected nodes', () => {
      getAllNodes().each(($el) => {
        const dataId = $el.data('id');
        if (initialNodeIds.indexOf(dataId) === -1) {
          triggerKeyboardEvent(cy.wrap($el.find('input')), 'a');
          triggerKeyboardEvent(cy.wrap($el.find('input')), 'a', true);
          getAllNodes().children('.dm-content').children().should('not.have.class', 'selected');
        }
      });
    });
  });

  describe('node with dropdown', () => {
    const initialNodeIds: string[] = [];
    beforeEach(() => {
      getAllNodes().each($el => initialNodeIds.push($el.data('id')));

      const inputNode = getPotentialNodeById('testId-dropdown');
      dragAndDropElement(inputNode, { pageX: 300, pageY: 400 });
    });

    it('selects value from dropdown on clicking without selecting node', () => {
      getAllNodes().each(($el) => {
        const dataId = $el.data('id');
        if (initialNodeIds.indexOf(dataId) === -1) {
          clickElement(getNodeById('node1'));
          // Enter some text and then press delete
          cy.wrap($el.find('select')).select('test');
          getNodeById('node1').children('.dm-content').children().should('have.class', 'selected');
          cy.wrap($el.find('select')).should('have.value', 'test');
        }
      });
    });
  });
});
