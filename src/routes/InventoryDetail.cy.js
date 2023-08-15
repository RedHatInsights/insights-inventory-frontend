/* eslint-disable rulesdir/disallow-fec-relative-imports */
import {
  featureFlagsInterceptors,
  hostsDetailInterceptors,
  hostsDetailTagsInterceptors,
  systemProfileInterceptors,
} from '../../cypress/support/interceptors';
import InventoryDetail from './InventoryDetail';
import { routes } from '../Routes';
import hostDetail from '../../cypress/fixtures/hostDetail.json';
import _ from 'lodash';
import { MODAL } from '@redhat-cloud-services/frontend-components-utilities';

const mountWithProps = (options, props = {}) =>
  cy.mountWithContext(InventoryDetail, options, props);

const waitForLoad = () =>
  cy.ouiaId('Host name value').should('have.text', hostDetail.results[0].fqdn);

const prepareTest = (hostDetail = hostDetail) => {
  featureFlagsInterceptors.successful();
  systemProfileInterceptors['full system profile, successful with response']();
  hostsDetailInterceptors.successful(hostDetail);
  hostsDetailTagsInterceptors.successful();

  mountWithProps({
    path: routes.detail,
    routerProps: { initialEntries: ['/host/test-host-id'] },
  });

  waitForLoad();
};

const hostInGroup = _.cloneDeep(hostDetail);
hostInGroup.results[0].groups = [
  {
    id: 'group-a-id',
    name: 'group-a-name',
  },
];

describe('renders correctly', () => {
  before(() => cy.mockWindowChrome());
  beforeEach(() => prepareTest());

  it('renders main components for edge host', () => {
    cy.get('.ins-entity-detail').should('have.length', 1);

    cy.get('[data-cy="patch-tab"]')
      .parent('.pf-c-tabs__item.pf-m-disabled')
      .should('have.length', 1);
    cy.get('[data-cy="compliance-tab"]')
      .parent('.pf-c-tabs__item.pf-m-disabled')
      .should('have.length', 1);

    cy.get('[data-cy="vulnerabilities-tab"]')
      .parent('.pf-c-tabs__item')
      .click();
    cy.get('[data-cy="vulnerability-edge-prompt"]').should('have.length', 1);

    // TODO: add more checks other for handling edge hosts
  });
});

describe('rbac integration', () => {
  describe('with no permissions', () => {
    before(() => cy.mockWindowChrome({ userPermissions: [] }));
    beforeEach(() => prepareTest(hostInGroup));

    it('should disable delete and edit buttons', () => {
      cy.contains('Delete')
        .should('exist')
        .and('have.attr', 'aria-disabled', 'true');
    });

    it('should disable edit buttons', () => {
      cy.ouiaId('Display name value')
        .find('[aria-label="Edit"]')
        .should('exist')
        .and('have.attr', 'aria-disabled', 'true');
      cy.ouiaId('Ansible hostname value')
        .find('[aria-label="Edit"]')
        .should('exist')
        .and('have.attr', 'aria-disabled', 'true');
    });
  });

  describe('with write permissions limited by group', () => {
    before(() =>
      cy.mockWindowChrome({
        userPermissions: [
          {
            permission: 'inventory:hosts:write',
            resourceDefinitions: [
              {
                attributeFilter: {
                  key: 'group.id',
                  operation: 'equal',
                  value: 'group-a-id',
                },
              },
            ],
          },
        ],
      })
    );
    beforeEach(() => prepareTest(hostInGroup));

    it('should enable delete and edit buttons', () => {
      cy.contains('Delete').should('exist').and('be.enabled');
    });

    it('should enable edit buttons', () => {
      cy.ouiaId('Display name value').find('[aria-label="Edit"]').click();
      cy.get(MODAL).find('h1').contains('Edit display name');
      cy.ouiaId('edit-display-name-modal-ModalBoxCloseButton').click();
      cy.ouiaId('Ansible hostname value').find('[aria-label="Edit"]').click();
      cy.get(MODAL).find('h1').contains('Edit Ansible host');
    });
  });

  describe('with excluding group permissions', () => {
    before(() =>
      cy.mockWindowChrome({
        userPermissions: [
          {
            permission: 'inventory:hosts:write',
            resourceDefinitions: [
              {
                attributeFilter: {
                  key: 'group.id',
                  operation: 'equal',
                  value: null,
                },
              },
            ],
          },
        ],
      })
    );

    beforeEach(prepareTest);

    it('should enable delete and edit buttons', () => {
      cy.contains('Delete').should('exist').and('be.enabled');
    });

    it('should enable edit buttons', () => {
      cy.ouiaId('Display name value').find('[aria-label="Edit"]').click();
      cy.get(MODAL).find('h1').contains('Edit display name');
      cy.ouiaId('edit-display-name-modal-ModalBoxCloseButton').click();
      cy.ouiaId('Ansible hostname value').find('[aria-label="Edit"]').click();
      cy.get(MODAL).find('h1').contains('Edit Ansible host');
    });
  });
});
