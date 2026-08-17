import SystemsView from './SystemsView';
import {
  groupsInterceptors,
  systemProfileInterceptors,
} from '../../../cypress/support/interceptors';

// Custom column selector that includes inventory + app-data columns for testing
const selectTestColumns = (allColumns) => {
  const columnsToShow = [
    'display_name',
    'operating_system',
    'last_check_in',
    'advisor:recommendations',
    'vulnerability:total_cves',
    'compliance:policies_count',
  ];
  const showKeys = new Set(columnsToShow);

  return allColumns.map((col) => {
    const shouldShow = showKeys.has(col.key);
    return {
      ...col,
      isShown: shouldShow,
      isShownByDefault: shouldShow,
    };
  });
};

// Minimal fixture data matching the InventoryViewSystem shape
const createMockHosts = () => [
  {
    id: 'test-host-001',
    display_name: 'test-host-1.example.com',
    fqdn: 'test-host-1.example.com',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-08-01T00:00:00.000Z',
    stale_timestamp: '2026-09-01T00:00:00.000Z',
    stale_warning_timestamp: '2026-09-08T00:00:00.000Z',
    culled_timestamp: '2026-09-15T00:00:00.000Z',
    os_release: 'RHEL 9.4',
    system_profile: {},
    groups: [],
    app_data: {
      advisor: {
        recommendations: 5,
        incidents: 1,
        critical: 0,
        important: 2,
        moderate: 2,
        low: 1,
      },
      vulnerability: {
        total_cves: 12,
        critical_cves: 1,
        important_cves: 3,
        cves_with_security_rules: 0,
        cves_with_known_exploits: 1,
      },
      compliance: {
        policies: [{}, {}], // 2 policies
        last_scan: '2026-07-15T10:00:00.000Z',
      },
    },
  },
  {
    id: 'test-host-002',
    display_name: 'test-host-2.example.com',
    fqdn: 'test-host-2.example.com',
    created: '2026-02-01T00:00:00.000Z',
    updated: '2026-08-01T00:00:00.000Z',
    stale_timestamp: '2026-09-01T00:00:00.000Z',
    stale_warning_timestamp: '2026-09-08T00:00:00.000Z',
    culled_timestamp: '2026-09-15T00:00:00.000Z',
    os_release: 'RHEL 8.10',
    system_profile: {},
    groups: [],
    app_data: {
      advisor: {
        recommendations: 3,
        incidents: 0,
        critical: 0,
        important: 1,
        moderate: 1,
        low: 1,
      },
      vulnerability: {
        total_cves: 8,
        critical_cves: 0,
        important_cves: 2,
        cves_with_security_rules: 1,
        cves_with_known_exploits: 0,
      },
      compliance: {
        policies: [{}], // 1 policy
        last_scan: '2026-07-20T14:00:00.000Z',
      },
    },
  },
];

const createMockQuery = (deniedServices = []) => {
  return () => ({
    data: createMockHosts(),
    total: 2,
    deniedServices,
    isLoading: false,
    isFetching: false,
    isError: false,
  });
};

const setInventoryViewsFeatureFlag = () => {
  cy.intercept('GET', '/feature_flags*', {
    statusCode: 200,
    body: {
      toggles: [
        {
          name: 'ui.inventory-views',
          enabled: true,
          variant: {
            name: 'enabled',
            enabled: true,
          },
        },
      ],
    },
  }).as('getFeatureFlag');
};

const mountSystemsView = (deniedServices = [], routerProps = {}) => {
  setInventoryViewsFeatureFlag();
  systemProfileInterceptors['operating system, successful empty']();
  groupsInterceptors['successful empty']();
  localStorage.setItem('ui.inventory-views', 'true');
  cy.mockWindowInsights();
  cy.mountWithContext(SystemsView, routerProps, {
    useDataQuery: createMockQuery(deniedServices),
    onInvalidate: cy.stub(),
    columns: selectTestColumns,
  });
};

describe('Per-service RBAC column gating', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows lock icons for denied services and real data for allowed services', () => {
    mountSystemsView(['vulnerability', 'compliance']);

    // Wait for table to load
    cy.contains('test-host-1.example.com').should('be.visible');

    // Verify: vulnerability columns show lock icons (2 rows, both denied)
    cy.get('td span[aria-label*="do not have the necessary Vulnerability"]')
      .should('have.length', 2)
      .first()
      .find('svg')
      .should('exist');

    // Verify: compliance columns show lock icons (2 rows, both denied)
    cy.get(
      'td span[aria-label*="do not have the necessary Compliance"]',
    ).should('have.length', 2);

    // Verify: advisor columns show real data (no lock icons)
    cy.get('td span[aria-label*="do not have the necessary Advisor"]').should(
      'not.exist',
    );

    // Verify advisor data is actually rendered
    cy.contains('td', '5').should('be.visible'); // recommendations for host 1
    cy.contains('td', '3').should('be.visible'); // recommendations for host 2
  });

  it('automatically falls back to display_name sort when sorted column is denied', () => {
    // Mount with URL params that set sort to vulnerability:total_cves
    // AND with vulnerability denied - the useEffect should detect the locked
    // sort column on mount and automatically fall back to display_name ascending
    mountSystemsView(['vulnerability'], {
      routerProps: {
        initialEntries: ['/?sort=vulnerability:total_cves&sort_dir=desc'],
      },
    });

    // Wait for table to load
    cy.contains('test-host-1.example.com').should('be.visible');

    // Verify: Total CVEs column shows lock icons (denied)
    cy.get(
      'td span[aria-label*="do not have the necessary Vulnerability"]',
    ).should('have.length', 2);

    // Verify: sort has automatically fallen back to Name (display_name) ascending
    // The useEffect in useColumns.tsx detects the locked column and resets to FALLBACK_SORT
    cy.contains('th', 'Name').should('have.attr', 'aria-sort', 'ascending');

    // Verify table is still functional
    cy.contains('test-host-1.example.com').should('be.visible');
    cy.contains('test-host-2.example.com').should('be.visible');
  });

  it('shows no lock icons when denied_services is empty', () => {
    mountSystemsView([]);

    // Wait for table to load
    cy.contains('test-host-1.example.com').should('be.visible');

    // Verify: no lock icons anywhere
    cy.get('td span[aria-label*="do not have the necessary"]').should(
      'not.exist',
    );

    // Verify real vulnerability data is shown
    cy.contains('td', '12').should('be.visible'); // total_cves for host 1
    cy.contains('td', '8').should('be.visible'); // total_cves for host 2

    // Verify real advisor data is shown
    cy.contains('td', '5').should('be.visible'); // recommendations for host 1
    cy.contains('td', '3').should('be.visible'); // recommendations for host 2

    // Verify real compliance data is shown
    cy.contains('td', '2').should('be.visible'); // policies_count for host 1
    cy.contains('td', '1').should('be.visible'); // policies_count for host 2
  });

  it('table is functional when all non-inventory services are denied', () => {
    mountSystemsView([
      'advisor',
      'compliance',
      'content',
      'malware',
      'vulnerability',
    ]);

    // Wait for table to load
    cy.contains('test-host-1.example.com').should('be.visible');

    // Verify: all app-data columns show lock icons
    cy.get('td span[aria-label*="do not have the necessary Advisor"]').should(
      'have.length',
      2,
    );
    cy.get(
      'td span[aria-label*="do not have the necessary Vulnerability"]',
    ).should('have.length', 2);
    cy.get(
      'td span[aria-label*="do not have the necessary Compliance"]',
    ).should('have.length', 2);

    // Verify: inventory columns show real data
    cy.contains('th', 'Name').should('be.visible');
    cy.contains('td', 'test-host-1.example.com').should('be.visible');
    cy.contains('td', 'test-host-2.example.com').should('be.visible');

    // Verify: Name column is sortable
    cy.contains('th', 'Name').find('button').should('exist');

    // Click to sort
    cy.contains('th', 'Name').find('button').click();
    cy.contains('th', 'Name').should('have.attr', 'aria-sort');

    // Verify table is still functional
    cy.contains('test-host-1.example.com').should('be.visible');
    cy.contains('test-host-2.example.com').should('be.visible');
  });
});
