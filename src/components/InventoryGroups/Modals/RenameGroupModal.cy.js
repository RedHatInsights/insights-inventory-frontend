/* eslint-disable rulesdir/disallow-fec-relative-imports */
import RenameGroupModal from './RenameGroupModal';
import { TEXT_INPUT } from '@redhat-cloud-services/frontend-components-utilities';
import groups from '../../../../cypress/fixtures/groups.json';

const setInterceptors = () => {
  cy.intercept('GET', '**/api/inventory/v1/groups', {
    statusCode: 200,
    body: groups,
  }).as('validate');
  cy.intercept('PATCH', '**/api/inventory/v1/groups/1', {
    statusCode: 200,
    body: groups,
  }).as('rename');
};

const TEST_GROUP_NAME = 'Ut';

describe('test data', () => {
  it('fixtures should have the test group', () => {
    expect(
      groups.results.find(({ name }) => name === TEST_GROUP_NAME)
    ).not.to.eq(undefined);
  });
});

describe('render the modal', () => {
  before(() => {
    cy.mockWindowInsights();
  });

  beforeEach(setInterceptors);

  it('input is fillable and firing a validation request that succeeds', () => {
    cy.mountWithContext(RenameGroupModal, undefined, {
      isModalOpen: true,
      reloadData: () => console.log('data reloaded'),
      modalState: { id: '1', name: 'U' },
    });

    cy.get(TEXT_INPUT).type('t');
    cy.wait('@validate').then((xhr) => {
      expect(xhr.request.url).to.contain('groups');
    });
    cy.get(`button[type="submit"]`).shouldHaveAriaDisabled();
  });

  it('user can rename the group', () => {
    cy.mountWithContext(RenameGroupModal, undefined, {
      isModalOpen: true,
      reloadData: () => console.log('data reloaded'),
      modalState: { id: '1', name: 'sre-group' },
    });

    cy.get(TEXT_INPUT).type('newname');
    cy.get(`button[type="submit"]`).shouldHaveAriaDisabled();
    cy.get(`button[type="submit"]`).click();
    cy.wait('@rename');
  });
});
