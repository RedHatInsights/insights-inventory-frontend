import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  featureFlagsInterceptors,
  hostsDetailInterceptors,
  hostsDetailTagsInterceptors,
  systemProfileInterceptors,
} from '../../cypress/support/interceptors';
import InventoryDetail from './InventoryDetail';
import hostDetail from '../../cypress/fixtures/hostDetail.json';
import _ from 'lodash';
import { TEXT_INPUT } from '@redhat-cloud-services/frontend-components-utilities';

const mountWithProps = (options, props = {}) =>
  cy.mountWithContext(InventoryDetail, options, props);

const InventoryDetailWithRouteSwitch = () => {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/inventory/other-host')}>
        Switch host
      </button>
      <InventoryDetail />
    </>
  );
};

const InventoryDetailDeleteRoutes = () => {
  const location = useLocation();
  return (
    <>
      <div data-cy="current-route">{location.pathname}</div>
      <Routes>
        <Route path="/inventory/:inventoryId" element={<InventoryDetail />} />
        <Route path="/" element={<div>Inventory list</div>} />
      </Routes>
    </>
  );
};

const waitForLoad = () => {
  cy.get('.ins-c-inventory-detail__app-tabs').contains('Overview').click();
  cy.ouiaId('Host name value').should('have.text', hostDetail.results[0].fqdn);
};
const prepareTest = (hostDetail = hostDetail) => {
  featureFlagsInterceptors.successful();
  systemProfileInterceptors['full system profile, successful with response']();
  hostsDetailInterceptors.successful(hostDetail);
  hostsDetailTagsInterceptors.successful();

  mountWithProps({
    path: '/inventory/:inventoryId',
    routerProps: { initialEntries: ['/inventory/test-host-id'] },
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
hostInGroup.results[0].system_profile.operating_system.name = 'RHEL';

const kesselEnabled = () =>
  cy.intercept('GET', '/feature_flags*', {
    statusCode: 200,
    body: {
      toggles: [{ name: 'hbi.rbac-v2', enabled: true }],
    },
  });

const kesselDisabled = () =>
  cy.intercept('GET', '/feature_flags*', {
    statusCode: 200,
    body: {
      toggles: [{ name: 'hbi.rbac-v2', enabled: false }],
    },
  });

const kesselDenied = () =>
  cy.intercept('POST', '/api/kessel/v1beta2/checkselfbulk', {
    statusCode: 200,
    body: {
      pairs: [
        { item: { allowed: 'ALLOWED_FALSE' } },
        { item: { allowed: 'ALLOWED_FALSE' } },
        { item: { allowed: 'ALLOWED_FALSE' } },
      ],
    },
  });

const mountKesselDetail = () =>
  mountWithProps({
    path: '/inventory/:inventoryId',
    routerProps: { initialEntries: ['/inventory/test-host-id'] },
  });

describe('renders correctly', () => {
  before(() => cy.mockWindowInsights());
  beforeEach(() => prepareTest(hostInGroup));

  it('renders main components for edge host', () => {
    cy.get('.ins-entity-detail').should('have.length', 1);

    cy.get('[data-cy="patch-tab"]')
      .parent('.pf-v6-c-tabs__item.pf-m-disabled')
      .should('have.length', 1);
    cy.get('[data-cy="compliance-tab"]')
      .parent('.pf-v6-c-tabs__item.pf-m-disabled')
      .should('have.length', 1);
    cy.get('[data-cy="vulnerabilities-tab"]')
      .parent('.pf-v6-c-tabs__item')
      .should('have.length', 1);

    // TODO: add more checks other for handling edge hosts
  });
});

describe('Inventory detail access and missing systems', () => {
  beforeEach(() => {
    cy.mockWindowInsights();
    kesselEnabled();
    kesselDenied();
  });

  it('shows System not found when the host lookup returns no system', () => {
    cy.intercept('GET', '/api/inventory/v1/hosts/test-host-id*', {
      statusCode: 200,
      body: { total: 0, count: 0, page: 1, per_page: 50, results: [] },
    }).as('getMissingHost');
    cy.intercept(
      'GET',
      '/api/inventory/v1/hosts/test-host-id/system_profile*',
      {
        statusCode: 200,
        body: { results: [] },
      },
    );

    mountKesselDetail();

    cy.wait('@getMissingHost');
    cy.contains('System not found').should('be.visible');
    cy.contains('You do not have access to this system').should('not.exist');
  });

  it('waits for the inventory lookup before showing access denied', () => {
    cy.intercept('GET', '/api/inventory/v1/hosts/test-host-id*', {
      statusCode: 200,
      delay: 300,
      body: { total: 0, count: 0, page: 1, per_page: 50, results: [] },
    }).as('getMissingHost');
    cy.intercept(
      'GET',
      '/api/inventory/v1/hosts/test-host-id/system_profile*',
      {
        statusCode: 200,
        body: { results: [] },
      },
    );

    mountKesselDetail();

    cy.get('[aria-label="Loading system"]').should('be.visible');
    cy.contains('You do not have access to this system').should('not.exist');
    cy.wait('@getMissingHost');
    cy.contains('System not found').should('be.visible');
  });

  it('shows the inventory lookup error instead of masking a server failure as access denied', () => {
    cy.intercept('GET', '/api/inventory/v1/hosts/test-host-id*', {
      statusCode: 500,
      body: {},
    }).as('getHostFailure');
    cy.intercept(
      'GET',
      '/api/inventory/v1/hosts/test-host-id/system_profile*',
      {
        statusCode: 200,
        body: { results: [] },
      },
    );

    mountKesselDetail();

    cy.wait('@getHostFailure');
    cy.get('.ins-entity-detail .pf-v6-c-empty-state').should('be.visible');
    cy.contains('You do not have access to this system').should('not.exist');
  });

  it('shows System not found when a refreshed details route returns 404', () => {
    cy.intercept('GET', '/api/inventory/v1/hosts/test-host-id*', {
      statusCode: 404,
      body: {
        detail: 'One or more hosts not found.',
        not_found_ids: ['test-host-id'],
        status: 404,
        title: 'Not Found',
        type: 'about:blank',
      },
    }).as('getMissingHost');
    cy.intercept(
      'GET',
      '/api/inventory/v1/hosts/test-host-id/system_profile*',
      {
        statusCode: 200,
        body: { results: [] },
      },
    );

    mountKesselDetail();

    cy.wait('@getMissingHost');
    cy.contains('System not found').should('be.visible');
    cy.contains('You do not have access to this system').should('not.exist');
  });

  it('ignores a slow lookup after navigating to a different system', () => {
    kesselDisabled();
    systemProfileInterceptors[
      'full system profile, successful with response'
    ]();
    const otherHost = _.cloneDeep(hostDetail);
    otherHost.results[0].id = 'other-host';
    otherHost.results[0].display_name = 'other-host-name';

    cy.intercept('GET', /\/api\/inventory\/v1\/hosts\/test-host-id(?:\?.*)?$/, {
      statusCode: 200,
      body: hostDetail,
      delay: 1500,
    }).as('firstHostLookup');
    cy.intercept('GET', /\/api\/inventory\/v1\/hosts\/other-host(?:\?.*)?$/, {
      statusCode: 200,
      body: otherHost,
    }).as('otherHostLookup');

    cy.mountWithContext(InventoryDetailWithRouteSwitch, {
      path: '/inventory/:inventoryId',
      routerProps: { initialEntries: ['/inventory/test-host-id'] },
    });

    cy.get('@firstHostLookup.all').should('have.length', 1);
    cy.contains('Switch host').click();
    cy.wait('@otherHostLookup');
    cy.wait('@firstHostLookup');
    cy.contains('other-host-name').should('be.visible');
  });

  it('keeps access denied for an existing system the user cannot view', () => {
    hostsDetailInterceptors.successful(hostDetail);
    systemProfileInterceptors[
      'full system profile, successful with response'
    ]();
    hostsDetailTagsInterceptors.successful();

    mountKesselDetail();

    cy.contains('You do not have access to this system').should('be.visible');
    cy.contains('System not found').should('not.exist');
  });
});

describe('delete navigation from system details', () => {
  beforeEach(() => {
    cy.mockWindowInsights();
    kesselDisabled();
    systemProfileInterceptors[
      'full system profile, successful with response'
    ]();
    hostsDetailInterceptors.successful();
    hostsDetailTagsInterceptors.successful();
    cy.intercept(
      'DELETE',
      `/api/inventory/v1/hosts/${hostDetail.results[0].id}`,
      { statusCode: 204 },
    ).as('deleteHost');
  });

  it('returns to the inventory list after a successful delete', () => {
    cy.mountWithContext(InventoryDetailDeleteRoutes, {
      routerProps: {
        initialEntries: ['/', '/inventory/test-host-id'],
      },
    });

    cy.window().then((window) => {
      window.history.replaceState(
        { ...window.history.state, idx: 1 },
        '',
        window.location.href,
      );
    });

    cy.contains('Delete').click();
    cy.get('[data-testid="confirm-inventory-delete"]').click();
    cy.wait('@deleteHost').its('response.statusCode').should('eq', 204);

    cy.contains('Inventory list').should('be.visible');
    cy.get('[data-cy="current-route"]').should('have.text', '/');
  });
});

describe('rbac integration', () => {
  describe('with no permissions', () => {
    before(() => cy.mockWindowInsights({ userPermissions: [] }));
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
      cy.mockWindowInsights({
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
      }),
    );
    beforeEach(() => prepareTest(hostInGroup));

    it('should enable delete and edit buttons', () => {
      cy.contains('Delete').should('exist').and('be.enabled');
    });

    it('should enable edit buttons', () => {
      cy.ouiaId('Display name value').find('[aria-label="Edit"]').click();
      cy.get(TEXT_INPUT).first().should('have.value', 'host-1');
      cy.ouiaId('Ansible hostname value').find('[aria-label="Edit"]').click();
      cy.get(TEXT_INPUT).last().should('have.value', 'fqdn-1');
    });
  });

  describe('with excluding group permissions', () => {
    before(() =>
      cy.mockWindowInsights({
        userPermissions: [
          {
            permission: 'inventory:hosts:write',
            resourceDefinitions: [
              {
                attributeFilter: {
                  key: 'group.id',
                  operation: 'equal',
                  //ask about this value
                  value: 'group-a-id',
                },
              },
            ],
          },
        ],
      }),
    );

    beforeEach(() => prepareTest(hostInGroup));

    it('should enable delete and edit buttons', () => {
      cy.contains('Delete').should('exist').and('be.enabled');
    });

    it('should enable edit buttons', () => {
      cy.ouiaId('Display name value').find('[aria-label="Edit"]').click();
      cy.get(TEXT_INPUT).first().should('have.value', 'host-1');
      cy.ouiaId('Ansible hostname value').find('[aria-label="Edit"]').click();
      cy.get(TEXT_INPUT).last().should('have.value', 'fqdn-1');
    });
  });
});
