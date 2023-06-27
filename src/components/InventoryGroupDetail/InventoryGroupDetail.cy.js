/* eslint-disable rulesdir/disallow-fec-relative-imports */
import {
  DROPDOWN_ITEM,
  MODAL,
} from '@redhat-cloud-services/frontend-components-utilities';
import groupDetailFixtures from '../../../cypress/fixtures/groups/620f9ae75A8F6b83d78F3B55Af1c4b2C.json';
import {
  groupDetailInterceptors,
  groupsInterceptors,
} from '../../../cypress/support/interceptors';
import InventoryGroupDetail from './InventoryGroupDetail';

const TEST_GROUP_ID = '620f9ae75A8F6b83d78F3B55Af1c4b2C';

const mountPage = () =>
  cy.mountWithContext(InventoryGroupDetail, undefined, {
    groupId: TEST_GROUP_ID,
  });

before(() => {
  cy.mockWindowChrome();
});

describe('group detail page', () => {
  it('name from server is rendered in header and breadcrumb', () => {
    groupDetailInterceptors.successful();
    mountPage();

    cy.wait('@getGroupDetail');
    cy.get('h1').contains(groupDetailFixtures.results[0].name);
    cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li')
      .last()
      .should('have.text', groupDetailFixtures.results[0].name);
  });

  it('skeletons rendered while fetching data', () => {
    groupDetailInterceptors['long responding']();
    mountPage();

    cy.get('[data-ouia-component-type="PF4/Breadcrumb"] li')
      .last()
      .find('.pf-c-skeleton');
    cy.get('h1').find('.pf-c-skeleton');
    cy.get('.pf-c-empty-state').find('.pf-c-spinner');
  });

  it('can rename group', () => {
    groupsInterceptors['successful with some items'](); // intercept modal validation requests
    groupDetailInterceptors.successful();
    groupDetailInterceptors['patch successful']();
    mountPage();

    cy.ouiaId('group-actions-dropdown-toggle').should('be.enabled').click();
    cy.get(DROPDOWN_ITEM).contains('Rename').click();

    cy.get(MODAL).find('input').type('1');
    cy.get(MODAL).find('button[type=submit]').click();

    cy.wait('@patchGroup')
      .its('request.body')
      .should('deep.equal', {
        name: `${groupDetailFixtures.results[0].name}1`,
      });
    cy.wait('@getGroupDetail'); // the page is refreshed after submition
  });

  it('can delete an empty group', () => {
    groupDetailInterceptors.successful();
    groupDetailInterceptors['delete successful']();
    mountPage();

    cy.ouiaId('group-actions-dropdown-toggle').should('be.enabled').click();
    cy.get(DROPDOWN_ITEM).contains('Delete').click();

    cy.get(`div[class="pf-c-check"]`).click();
    cy.get(`button[type="submit"]`).click();
    cy.wait('@deleteGroup')
      .its('request.url')
      .should('contain', groupDetailFixtures.results[0].id);
  });
});
