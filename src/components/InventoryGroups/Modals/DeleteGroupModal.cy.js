/* eslint-disable rulesdir/disallow-fec-relative-imports */
import {
  CHECKBOX,
  MODAL_CONTENT,
} from '@redhat-cloud-services/frontend-components-utilities';
import {
  deleteGroupsInterceptors,
  groupsInterceptors,
} from '../../../../cypress/support/interceptors';
import { buildGroups, buildGroupsPayload } from '../../../__factories__/groups';
import DeleteGroupModal from './DeleteGroupModal';

const mountModal = (props) =>
  cy.mountWithContext(DeleteGroupModal, undefined, props);

before(() => {
  cy.mockWindowInsights();
});

describe('multiple non-empty groups', () => {
  const fixtures = buildGroupsPayload();

  beforeEach(() => {
    groupsInterceptors['successful with some items'](fixtures);

    const setIsModalOpen = cy.stub().as('setIsModalOpen');
    const reloadData = cy.stub().as('reloadData');

    mountModal({
      isModalOpen: true,
      setIsModalOpen,
      reloadData,
      groupIds: fixtures.results.map(({ id }) => id),
    });

    cy.wait('@getGroups');
  });

  it('renders correct content', () => {
    cy.get('h1').should('have.text', 'Cannot delete groups at this time');
    cy.get('p').should(
      'contain.text',
      `Groups containing systems cannot be deleted.`
    );
  });

  it('renders spinner when loading', () => {
    groupsInterceptors['long responding']();
    mountModal({
      isModalOpen: true,
      groupIds: fixtures.results.map(({ id }) => id),
    });
    cy.get('[role="progressbar"]');
    cy.get(MODAL_CONTENT).should('not.exist');
  });

  it('can close the modal with the cross button', () => {
    cy.get('button[aria-label="Close"]').click();
    cy.get('@setIsModalOpen').should('be.calledOnce');
  });

  it('can close the modal with Close', () => {
    cy.get('button').contains('Close').click();
    cy.get('@setIsModalOpen').should('be.calledOnce');
  });

  it('handles big number of groups', () => {
    groupsInterceptors['successful with some items']();

    const setIsModalOpen = cy.stub().as('setIsModalOpen');
    const reloadData = cy.stub().as('reloadData');

    mountModal({
      isModalOpen: true,
      setIsModalOpen,
      reloadData,
      groupIds: buildGroups(101).map(({ id }) => id),
    });

    for (let i = 0; i < 6; i++) {
      cy.wait('@getGroups'); // should make 6 batched requests
    }

    cy.get('p').should(
      'contain.text',
      `Groups containing systems cannot be deleted.`
    );
  });
});

describe('multiple empty groups', () => {
  const fixtures = buildGroupsPayload(undefined, undefined, undefined, true); // generate empty groups

  beforeEach(() => {
    groupsInterceptors['successful with some items'](fixtures);
    deleteGroupsInterceptors['successful deletion']();

    const setIsModalOpen = cy.stub().as('setIsModalOpen');
    const reloadData = cy.stub().as('reloadData');

    mountModal({
      isModalOpen: true,
      setIsModalOpen,
      reloadData,
      groupIds: fixtures.results.map(({ id }) => id),
    });

    cy.wait('@getGroups');
  });

  it('renders correct content', () => {
    cy.get('h1').should('have.text', 'Delete groups?');
    cy.get('p').should(
      'have.text',
      `${fixtures.results.length} groups and all their data will be deleted.`
    );
  });

  it('user can delete after checking the warning', () => {
    cy.get('button').contains('Delete').should('be.disabled');
    cy.get(CHECKBOX).click();
    cy.get('button').contains('Delete').should('be.enabled').click();
    cy.wait('@deleteGroups');
    // check that modal calls functions after completion
    cy.get('@setIsModalOpen').should('be.calledOnce');
    cy.get('@reloadData').should('be.calledOnce');
  });

  it('can close the modal with the cross button', () => {
    cy.get(
      '[data-ouia-component-id="group-modal-ModalBoxCloseButton"]'
    ).click();
    cy.get('@setIsModalOpen').should('be.calledOnce');
  });

  it('can close the modal with Cancel', () => {
    cy.get('button').contains('Cancel').click();
    cy.get('@setIsModalOpen').should('be.calledOnce');
  });

  it('handles big number of groups', () => {
    groupsInterceptors['successful with some items'](
      buildGroupsPayload(undefined, undefined, 20, true)
    );

    const setIsModalOpen = cy.stub().as('setIsModalOpen');
    const reloadData = cy.stub().as('reloadData');

    mountModal({
      isModalOpen: true,
      setIsModalOpen,
      reloadData,
      groupIds: buildGroups(101, true).map(({ id }) => id),
    });

    for (let i = 0; i < 6; i++) {
      cy.wait('@getGroups'); // should make 6 batched requests
    }

    cy.get('p').should(
      'contain.text',
      `groups and all their data will be deleted.`
    );
  });
});

describe('single non-empty group', () => {
  const fixtures = buildGroupsPayload(undefined, undefined, 1, false, true);

  beforeEach(() => {
    groupsInterceptors['successful with some items'](fixtures);

    const setIsModalOpen = cy.stub().as('setIsModalOpen');
    const reloadData = cy.stub().as('reloadData');

    mountModal({
      isModalOpen: true,
      setIsModalOpen,
      reloadData,
      groupIds: fixtures.results.map(({ id }) => id),
    });

    cy.wait('@getGroups');
  });

  it('renders correct content', () => {
    cy.get('h1').should('have.text', 'Cannot delete group at this time');
    cy.get('p').should(
      'have.text',
      `Groups containing systems cannot be deleted. To delete ${fixtures.results[0].name}, first remove all of the systems from it.`
    );
  });

  it('can close the modal with the cross button', () => {
    cy.get('button[aria-label="Close"]').click();
    cy.get('@setIsModalOpen').should('be.calledOnce');
  });

  it('can close the modal with Close', () => {
    cy.get('button').contains('Close').click();
    cy.get('@setIsModalOpen').should('be.calledOnce');
  });
});

describe('single empty group', () => {
  const fixtures = buildGroupsPayload(undefined, undefined, 1, true);

  beforeEach(() => {
    groupsInterceptors['successful with some items'](fixtures);
    deleteGroupsInterceptors['successful deletion']();

    const setIsModalOpen = cy.stub().as('setIsModalOpen');
    const reloadData = cy.stub().as('reloadData');

    mountModal({
      isModalOpen: true,
      setIsModalOpen,
      reloadData,
      groupIds: fixtures.results.map(({ id }) => id),
    });

    cy.wait('@getGroups');
  });

  it('renders correct content', () => {
    cy.get('h1').should('have.text', 'Delete group?');
    cy.get('p').should(
      'contain.text',
      `${fixtures.results[0].name} and all its data will be deleted.`
    );
  });

  it('user can delete after checking the warning', () => {
    cy.get('button').contains('Delete').should('be.disabled');
    cy.get(CHECKBOX).click();
    cy.get('button').contains('Delete').should('be.enabled').click();
    cy.wait('@deleteGroups');
    // check that modal calls functions after completion
    cy.get('@setIsModalOpen').should('be.calledOnce');
    cy.get('@reloadData').should('be.calledOnce');
  });
});
