import React from 'react';
import HybridInventoryTabs from './HybridInventoryTabs';
import { featureFlagsInterceptors } from '../../../cypress/support/interceptors';
import { Route, Routes } from 'react-router-dom';

const MockConventionalTab = () => (
  <div id="conventional">Mock conventional tab</div>
);
const MockImmutableTab = () => <div id="immutable">Mock immutable tab</div>;
// eslint-disable-next-line react/prop-types
const MockRouter = ({ path = '/insights/inventory', ...props }) => (
  <Routes>
    <Route path={path} element={<HybridInventoryTabs {...props} />} />
    <Route
      path={path + '/manage-edge-inventory'}
      element={<HybridInventoryTabs {...props} isImmutableTabOpen />}
    />
  </Routes>
);

const defaultProps = {
  ImmutableDevicesTab: <MockImmutableTab />,
  ConventionalSystemsTab: <MockConventionalTab />,
  hasConventionalSystems: true,
  accountHasEdgeImages: true,
};
const edgeEnabledProps = { ...defaultProps, isEdgeParityEnabled: true };

const mountWithProps = (props) => {
  return cy.mountWithContext(
    MockRouter,
    {
      routerProps: { initialEntries: ['/insights/inventory'] },
    },
    props
  );
};

before(() => {
  cy.mockWindowInsights();
});

describe('When edge parity feature is enabled', () => {
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: { results: [] } });
    featureFlagsInterceptors.edgeParitySuccessful();
  });

  it('renders conventional tab correctly for Inventory frontend without tabPath', () => {
    mountWithProps(edgeEnabledProps);
    cy.get('div[id="conventional"]').should('have.length', 1);
    cy.get('div[id="immutable"]').should('not.exist');
  });

  it('renders conventional tab correctly for Inventory frontend without tabPath', () => {
    mountWithProps({ isImmutableTabOpen: true, ...edgeEnabledProps });
    cy.get('div[id="conventional"]').should('not.exist');
    cy.get('div[id="immutable"]').should('have.length', 1);
  });

  it('should change to immutable tab correctly from conventional', () => {
    mountWithProps(edgeEnabledProps);

    //conventional tab should be default
    cy.get('div[id="conventional"]').should('have.length', 1);

    cy.get('button[aria-label="Immutable tab"]').click();
    cy.get('div[id="immutable"]').should('have.length', 1);
  });

  it('should prepend tabPath in front of tab key', () => {
    // other consumer apps have custom tab pathname. Tabs should work as normal
    const tabPathname = '/insights/vulnerability/';
    cy.mountWithContext(
      MockRouter,
      {
        routerProps: { initialEntries: [tabPathname] },
      },
      { ...edgeEnabledProps, path: tabPathname, tabPathname: tabPathname }
    );

    cy.get('div[id="conventional"]').should('have.length', 1);
    cy.get('button[aria-label="Immutable tab"]').click();

    cy.get('div[id="immutable"]').should('have.length', 1);
  });
});

describe('When there are edge devices, but no conventional systems', () => {
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: { results: [] } });
    featureFlagsInterceptors.edgeParitySuccessful();
  });
  it('should open immutable tab as default when there are edge devices, but not conventional', () => {
    mountWithProps({ ...edgeEnabledProps, hasConventionalSystems: false });

    cy.get('div[id="conventional"]').should('not.exist');
    cy.get('div[id="immutable"]').should('have.length', 1);
  });
});

describe('When edge parity feature is disabled', () => {
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: { results: [] } });
    featureFlagsInterceptors.edgeParityDisabled();
  });

  it('should render only conventional systems without tab wrapper', () => {
    defaultProps.isEdgeParityEnabled = false;
    mountWithProps(defaultProps);

    cy.get('div[id="conventional"]').should('have.length', 1);
    cy.get('div[id="immutable"]').should('not.exist');
    cy.get('.pf-c-tabs').should('not.exist');
  });
});
