/* eslint-disable rulesdir/disallow-fec-relative-imports */

import {
  ALERT,
  PT_CONDITIONAL_FILTER_TOGGLE,
  DROPDOWN_ITEM,
  TABLE,
  checkTableHeaders,
  ouiaId,
  selectRowN,
} from '@redhat-cloud-services/frontend-components-utilities';
import _ from 'lodash';
import {
  featureFlagsInterceptors,
  groupDetailInterceptors,
  groupsInterceptors,
  hostsFixtures,
  hostsInterceptors,
  systemProfileInterceptors,
} from '../../../../cypress/support/interceptors';
import AddSystemsToGroupModal from './AddSystemsToGroupModal';

const TABLE_HEADERS = [
  'Name',
  'Group',
  'Tags',
  'OS',
  'Update method',
  'Last seen',
];

const AVAILABLE_FILTER_NAMES = [
  'Name',
  'Status',
  'Operating system',
  'Data collector',
  'RHC status',
  'Last seen',
  'Group',
  'Tags',
];

before(() => {
  cy.mockWindowInsights();
});

const mountModal = () =>
  cy.mountWithContext(
    AddSystemsToGroupModal,
    {},
    {
      groupId: '620f9ae75A8F6b83d78F3B55Af1c4b2C',
      isModalOpen: true,
      setIsModalOpen: () => {},
    }
  );

describe('test data', () => {
  it('at least one system is already in a group', () => {
    const alreadyInGroup = hostsFixtures.results.filter(
      // eslint-disable-next-line camelcase
      ({ group_name }) => !_.isEmpty(group_name)
    );
    expect(alreadyInGroup.length).to.be.gte(1);
  });

  it('the first system in group has specific id', () => {
    const alreadyInGroup = hostsFixtures.results.filter(
      // eslint-disable-next-line camelcase
      ({ group_name }) => !_.isEmpty(group_name)
    );
    expect(alreadyInGroup[0].id).to.eq('anim');
  });
});

describe('AddSystemsToGroupModal', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080); // to accomadate the inventory table
    cy.intercept('*', { statusCode: 200 });
    hostsInterceptors.successful(); // default hosts list
    featureFlagsInterceptors.successful(); // to enable the Group column
    groupsInterceptors['successful with some items']();
    systemProfileInterceptors['operating system, successful empty']();
  });

  it('renders correct header and buttons', () => {
    mountModal();

    cy.wait('@getHosts');
    cy.get('h1').contains('Add systems');
    cy.get('button').contains('Add systems');
    cy.get('button').contains('Cancel');
  });

  it('renders the inventory table', () => {
    mountModal();

    cy.wait('@getHosts');
    cy.get(ouiaId('PrimaryToolbar'));
    cy.get(TABLE);
    cy.get('#options-menu-bottom-pagination');
    checkTableHeaders(TABLE_HEADERS);
  });

  it('can add systems that are not yet in group', () => {
    groupDetailInterceptors['post hosts successful']();
    mountModal();

    cy.get('table[aria-label="Host inventory"]').should(
      'have.attr',
      'data-ouia-safe',
      'true'
    );
    cy.get('button').contains('Add systems').should('be.disabled');
    selectRowN(3);
    cy.get('button').contains('Add systems').click();
    cy.wait('@postHosts')
      .its('request.body')
      .should('deep.equal', ['consectetur']);
  });

  it('cannot add systems that are already in group', () => {
    groupDetailInterceptors['post hosts successful']();
    mountModal();

    cy.get('table[aria-label="Host inventory"]').should(
      'have.attr',
      'data-ouia-safe',
      'true'
    );
    selectRowN(0);
    cy.get(ALERT); // check the alert is shown
    cy.get('button')
      .contains('Add systems')
      .should('have.attr', 'aria-disabled', 'true');
  });

  describe('filters', () => {
    it('has correct list of filters', () => {
      groupDetailInterceptors['successful with hosts']();
      mountModal();

      cy.wait('@getHosts');
      cy.get(PT_CONDITIONAL_FILTER_TOGGLE).click();
      cy.get(DROPDOWN_ITEM).each(($item, i) => {
        expect($item.text()).to.equal(AVAILABLE_FILTER_NAMES[i]);
      });
    });
  });
});
