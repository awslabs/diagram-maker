import {
  getAllEdges, getDiagramMakerView, getEdgeBadgeById, getEdgeById, getNodeById, getPotentialEdge,
} from '../common/getters';
import {
  clickElement, createEdgeBetween, dragAndDropElement, dragStartElement, triggerKeyboardEvent,
} from '../common/interaction';

describe('DiagramMaker.Edges', () => {
  describe('Edges with left right rectangular nodes', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=demos-diagram-maker--left-right-rectangular&args=&viewMode=story');
    });

    describe('edge rendering', () => {
      it('renders one edge between nodes', () => {
        const edge = getEdgeById('edge1');
        edge.should('have.length', 1);
        edge.should('have.class', 'dm-edge');
        edge.children().should('have.class', 'dm-path')
          .should('have.class', 'dm-path-inner')
          .should('have.class', 'dm-path-outer');
      });

      it('renders potential edge', () => {
        const outputNode = getNodeById('node2');
        const outputConnector = outputNode.children('.dm-connector-output');

        dragStartElement(outputConnector, { pageX: 0, pageY: 0 });

        const potentialEdge = getPotentialEdge();
        potentialEdge.should('have.length', 1);
        potentialEdge.should('have.class', 'dm-edge');
        potentialEdge.children().should('have.class', 'dm-path')
          .should('have.class', 'dm-path-inner');
      });
    });

    describe('select edge', () => {
      it('adds selected class to edge when selected', () => {
        const edge = getEdgeById('edge1');
        clickElement(edge);
        edge.should('have.class', 'dm-selected');
      });

      it('deselects selected nodes', () => {
        const node = getNodeById('node1');
        clickElement(node);
        const childElement = node.children('.dm-content').children();
        childElement.should('have.class', 'selected');
        const edge = getEdgeById('edge1');
        clickElement(edge);
        edge.should('have.class', 'dm-selected');
        getNodeById('node1').children('.dm-content').children().should('not.have.class', 'selected');
      });
    });

    describe('delete edge', () => {
      function selectEdgeAndKeyboardEvent(keyboardEvent: string): Cypress.Chainable {
        const edge = getEdgeById('edge1');
        clickElement(edge);
        triggerKeyboardEvent(getDiagramMakerView(), keyboardEvent);
        return getEdgeById('edge1');
      }

      it('deletes selected edge when Backspace is pressed', () => {
        const edge = selectEdgeAndKeyboardEvent('Backspace');
        edge.should('not.exist');
      });

      it('deletes selected edge when Delete is pressed', () => {
        const edge = selectEdgeAndKeyboardEvent('Delete');
        edge.should('not.exist');
      });

      it('does not delete selected edge when A key is pressed', () => {
        const edge = selectEdgeAndKeyboardEvent('A');
        edge.should('exist');
      });
    });

    describe('create edge', () => {
      it('creates an edge with left right rectangular nodes', () => {
        getAllEdges().should('have.length', 1);
        createEdgeBetween('node2', 'node1');
        getAllEdges().should('have.length', 2);
      });

      it('doesnt create another edge when creating a new edge with same source & destination', () => {
        getAllEdges().should('have.length', 1);
        createEdgeBetween('node1', 'node2');
        getAllEdges().should('have.length', 1);
      });
    });
  });

  describe('Edges with circular boundary nodes', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=demos-diagram-maker--boundary-circular&args=&viewMode=story');
    });

    describe('edge rendering', () => {
      it('renders one edge between two nodes', () => {
        const edge = getEdgeById('edge1');
        edge.should('have.length', 1);
        edge.should('have.class', 'dm-edge');
        edge.children().should('have.class', 'dm-path')
          .should('have.class', 'dm-path-inner')
          .should('have.class', 'dm-path-outer');
      });

      it('renders two edges between two nodes', () => {
        // edge2 and edge3 are between same node
        const edge2 = getEdgeById('edge2');

        edge2.should('have.length', 1);
        edge2.should('have.class', 'dm-edge');
        edge2.children().should('have.class', 'dm-path')
          .should('have.class', 'dm-path-inner')
          .should('have.class', 'dm-path-outer');

        const edge3 = getEdgeById('edge3');

        edge3.should('have.length', 1);
        edge3.should('have.class', 'dm-edge');
        edge3.children().should('have.class', 'dm-path')
          .should('have.class', 'dm-path-inner')
          .should('have.class', 'dm-path-outer');
      });

      it('renders edge with badge', () => {
        const edgeBadge = getEdgeBadgeById('edge1');
        const badgeContent = edgeBadge.children();
        badgeContent.should('have.class', 'dm-content');
      });

      it('renders two edges with badges not overlapping', () => {
        const badge1 = getEdgeBadgeById('edge2');

        badge1.then((b1) => {
          const rect1 = b1[0].getBoundingClientRect();

          const x1 = rect1.left + rect1.width / 2;
          const y1 = rect1.top + rect1.height / 2;

          const badge2 = getEdgeBadgeById('edge3');

          badge2.then((b2) => {
            const rect2 = b2[0].getBoundingClientRect();

            const x2 = rect2.left + rect2.width / 2;
            const y2 = rect2.top + rect2.height / 2;

            // Check the positions don't match to ensure badge isn't overlapping
            expect(x1).to.not.equal(x2);
            expect(y1).to.not.equal(y2);
          });
        });
      });

      it('renders edge with arrowhead', () => {
        const edge = getEdgeById('edge1');
        edge.children().should('have.attr', 'marker-end', 'url(#arrow)');
      });
    });

    describe('create edge', () => {
      it('creates an edge with circular nodes', () => {
        getAllEdges().should('have.length', 3);

        const inputNode = getNodeById('node1');

        inputNode.then((el) => {
          const rect = el[0].getBoundingClientRect();

          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;

          const outputNode = getNodeById('node2');
          const outputConnector = outputNode.children('.dm-content').children('.outer');

          dragAndDropElement(outputConnector, { pageX: x, pageY: y });

          getAllEdges().should('have.length', 4);
        });
      });
    });

    describe('select edge', () => {
      it('selects an edge when clicking on edge badge', () => {
        clickElement(getEdgeBadgeById('edge1'));
        getEdgeById('edge1').should('have.class', 'dm-selected');
      });
    });
  });

  describe('Edges with top bottom rectangular nodes', () => {
    beforeEach(() => {
      cy.visit('/iframe.html?id=demos-diagram-maker--top-bottom-rectangular&args=&viewMode=story');
    });

    describe('edge rendering', () => {
      it('renders one edge between nodes', () => {
        const edge = getEdgeById('edge1');
        edge.should('have.length', 1);
        edge.should('have.class', 'dm-edge');
        edge.children().should('have.class', 'dm-path')
          .should('have.class', 'dm-path-inner')
          .should('have.class', 'dm-path-outer');
      });
    });
  });
});
