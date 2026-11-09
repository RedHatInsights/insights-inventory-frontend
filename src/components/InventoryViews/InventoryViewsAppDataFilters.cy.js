import SystemsView from '../SystemsView/SystemsView';
import { bindInventoryViewColumns } from '../SystemsView/columns/inventoryViewColumns';
import { bindAdvisorFilters } from '../SystemsView/filters/advisor/bindAdvisorFilters';
import { bindVulnerabilityFilters } from '../SystemsView/filters/vulnerability/bindVulnerabilityFilter';

/*
 * Component tests for the Advisor + Vulnerability ("app services") toolbar
 * filters on the /hosts/views table.
 *
 * Mocking at the `fetchData` boundary lets us hand the table systems carrying
 * exact advisor/vulnerability counts, instead of uploading hosts or standing up
 * a VM. `applyAppDataFilters` below mirrors the semantics asserted by the
 * backend suite in insights-host-inventory:
 *   tests/api/host_views/test_advisor_filters.py
 *   tests/api/host_views/test_vulnerability_filters.py
 * When that contract changes, that is the function to update.
 *
 * Each test asserts both halves of the chain:
 *   1. the UI selection produces the right `filterParams` (the binding contract)
 *   2. the table renders the systems that those params select (the user outcome)
 */

// ---------------------------------------------------------------- table setup

// Only the app-data filters, so the toolbar stays narrow enough to render
// inline. These are the real bindings used by selectInventoryViewsFilters.
const selectAppDataFilters = (catalog) => [
  ...bindAdvisorFilters(catalog),
  ...bindVulnerabilityFilters(catalog),
];

// One visible column per filter under test, so each assertion about which
// systems came back sits next to the data that decided it.
//   recommendation_severity -> Recommendations (per-severity breakdown)
//   incident_status         -> Incidents
//   cve_severity            -> Vulnerabilities (per-severity breakdown)
//   known_exploit           -> CVEs with known exploits
//   security_rule           -> CVEs with security rules
const TEST_COLUMN_KEYS = [
  'display_name',
  'advisor:recommendations',
  'advisor:incidents',
  'vulnerability:total_cves',
  'vulnerability:cves_with_known_exploits',
  'vulnerability:cves_with_security_rules',
];

const selectTestColumns = () => {
  const showKeys = new Set(TEST_COLUMN_KEYS);

  return bindInventoryViewColumns().map((col) => {
    const shouldShow = showKeys.has(col.key);
    return { ...col, isShown: shouldShow, isShownByDefault: shouldShow };
  });
};

// -------------------------------------------------------------- mock systems

// Builds a system in the shape the views table consumes.
const makeHost = (name, appData) => ({
  id: `host-${name}`,
  display_name: name,
  fqdn: `${name}.example.com`,
  created: '2026-01-01T00:00:00.000Z',
  updated: '2026-08-01T00:00:00.000Z',
  stale_timestamp: '2099-09-01T00:00:00.000Z',
  stale_warning_timestamp: '2099-09-08T00:00:00.000Z',
  culled_timestamp: '2099-09-15T00:00:00.000Z',
  os_release: 'RHEL 9.4',
  system_profile: {},
  groups: [],
  ...(appData ? { app_data: appData } : {}),
});

const advisor = ({
  critical = 0,
  important = 0,
  moderate = 0,
  low = 0,
  incidents = 0,
}) => ({
  advisor: {
    critical,
    important,
    moderate,
    low,
    incidents,
    recommendations: critical + important + moderate + low,
  },
});

const vulnerability = ({
  critical_cves = 0,
  important_cves = 0,
  moderate_cves = 0,
  low_cves = 0,
  cves_with_known_exploits = 0,
  cves_with_security_rules = 0,
}) => ({
  vulnerability: {
    critical_cves,
    important_cves,
    moderate_cves,
    low_cves,
    cves_with_known_exploits,
    cves_with_security_rules,
    total_cves: critical_cves + important_cves + moderate_cves + low_cves,
  },
});

// Named so each assertion reads as "which systems should come back".
const MOCK_SYSTEMS = [
  makeHost('adv-critical-incident', advisor({ critical: 2, incidents: 3 })),
  makeHost('adv-critical-clean', advisor({ critical: 1, incidents: 0 })),
  makeHost('adv-low-incident', advisor({ low: 4, incidents: 5 })),
  makeHost('vuln-critical', vulnerability({ critical_cves: 3 })),
  makeHost('vuln-low', vulnerability({ low_cves: 4 })),
  makeHost('vuln-important', vulnerability({ important_cves: 3 })),
  makeHost(
    'vuln-exploit-and-rule',
    vulnerability({
      critical_cves: 1,
      cves_with_known_exploits: 2,
      cves_with_security_rules: 1,
    }),
  ),
  // No app_data at all: the backend treats these as NULL and excludes them from
  // *both* sides of every filter, including the negative options.
  makeHost('no-app-data', null),
];

// -------------------------------------------------- backend filter semantics

const ADVISOR_SEVERITY_KEY = {
  critical: 'critical',
  important: 'important',
  moderate: 'moderate',
  low: 'low',
};

const CVE_SEVERITY_KEY = {
  critical: 'critical_cves',
  important: 'important_cves',
  moderate: 'moderate_cves',
  low: 'low_cves',
};

const matchesCount = (actual, mode, positiveMode) =>
  mode === positiveMode ? actual > 0 : actual === 0;

// Filters mocked systems the way the backend filters real ones.
const applyAppDataFilters = (hosts, filterParams = {}) => {
  const {
    recommendationSeverity,
    incidentStatus,
    cveSeverity,
    knownExploit,
    securityRule,
  } = filterParams;

  return hosts.filter((host) => {
    const adv = host.app_data?.advisor;
    const vuln = host.app_data?.vulnerability;

    if (recommendationSeverity?.length) {
      if (!adv) return false;
      const hit = recommendationSeverity.some(
        (severity) => (adv[ADVISOR_SEVERITY_KEY[severity]] ?? 0) > 0,
      );
      if (!hit) return false;
    }

    if (incidentStatus) {
      if (!adv) return false;
      if (!matchesCount(adv.incidents ?? 0, incidentStatus, 'incident')) {
        return false;
      }
    }

    if (cveSeverity?.length) {
      if (!vuln) return false;
      const hit = cveSeverity.some(
        (severity) => (vuln[CVE_SEVERITY_KEY[severity]] ?? 0) > 0,
      );
      if (!hit) return false;
    }

    if (knownExploit) {
      if (!vuln) return false;
      const count = vuln.cves_with_known_exploits ?? 0;
      if (!matchesCount(count, knownExploit, 'has_known_exploit')) return false;
    }

    if (securityRule) {
      if (!vuln) return false;
      const count = vuln.cves_with_security_rules ?? 0;
      if (!matchesCount(count, securityRule, 'present')) return false;
    }

    return true;
  });
};

// `fetchData` stub that filters like the API would, recording every call so
// tests can assert the `filterParams` the toolbar produced.
const createFetchStub = (hosts = MOCK_SYSTEMS) => {
  const calls = [];

  return {
    calls,
    fetchData: (params) => {
      calls.push(params);
      const results = applyAppDataFilters(hosts, params.filterParams);
      return Promise.resolve({ results, total: results.length });
    },
  };
};

let fetchStub;

/*
 * Asserts on the filters the table last sent to the API.
 *
 *   expectRequestedFilters({ cveSeverity: ['critical'] }); // must be present
 *   expectRequestedFilters((params) => { ... });           // custom assertion
 *
 * The fetch happens shortly after the click, so this retries until it arrives.
 */
const expectRequestedFilters = (expected) =>
  cy.wrap(null, { log: false }).should(() => {
    const { calls } = fetchStub;
    expect(calls, 'table issued at least one fetch').to.not.be.empty;

    const filterParams = calls[calls.length - 1].filterParams;
    if (typeof expected === 'function') {
      expected(filterParams);
    } else {
      expect(filterParams).to.deep.include(expected);
    }
  });

// ------------------------------------------------------------------- mounting

const setFeatureFlags = () => {
  cy.intercept('GET', '/feature_flags*', {
    statusCode: 200,
    body: {
      toggles: [
        {
          name: 'ui.inventory-views',
          enabled: true,
          variant: { name: 'enabled', enabled: true },
        },
      ],
    },
  }).as('getFeatureFlag');
};

const mountTable = () => {
  setFeatureFlags();
  localStorage.setItem('ui.inventory-views', 'true');
  cy.mockWindowInsights();
  cy.mountWithContext(
    SystemsView,
    {},
    {
      queryKeyPrefix: 'inventory-views-app-data-filters',
      fetchData: fetchStub.fetchData,
      columns: selectTestColumns,
      filters: selectAppDataFilters,
    },
  );
  // Baseline: no filters applied, every mocked system is listed.
  cy.contains('td', 'adv-critical-incident').should('be.visible');
};

// ------------------------------------------------------- toolbar interaction

const FILTERS = {
  recommendationSeverity: {
    title: 'Recommendation severity',
    placeholder: 'Filter by recommendation severity',
  },
  incidentStatus: {
    title: 'Incidents',
    placeholder: 'Filter by incidents',
  },
  cveSeverity: {
    title: 'Vulnerability severity',
    placeholder: 'Filter by vulnerability severity',
  },
  knownExploit: {
    title: 'Known exploit',
    placeholder: 'Filter by known exploit',
  },
  securityRule: {
    title: 'CVEs with security rules',
    placeholder: 'Filter by CVEs with security rules',
  },
};

// Makes a filter the active attribute, revealing its value control.
const selectFilterAttribute = (title) => {
  cy.get('[data-ouia-component-id="DataViewFilters"]')
    .find('button.pf-v6-c-menu-toggle')
    .first()
    .click();
  cy.get('[role="menu"]:visible').contains('button', title).click();
};

// Activates a filter's attribute, then picks one of its options.
const chooseFilterOption = (filterKey, optionLabel) => {
  const { title, placeholder } = FILTERS[filterKey];
  selectFilterAttribute(title);
  cy.contains('button', placeholder).click();
  cy.get('[role="menu"]:visible').contains(optionLabel).click();
  // Multi-select menus stay open; close so the next toggle is clickable.
  cy.get('body').click(0, 0);
};

// PF labels their chip close button "Close <label>".
const removeFilterLabel = (optionLabel) =>
  cy.get(`button[aria-label="Close ${optionLabel}"]`).click();

const expectVisibleSystems = (names) => {
  cy.get('tbody tr').should('have.length', names.length);
  names.forEach((name) => cy.contains('td', name).should('be.visible'));
};

const expectSystemsAbsent = (names) =>
  names.forEach((name) => cy.contains('td', name).should('not.exist'));

// Asserts the cell text under a column, for every visible row.
const expectColumnCells = (columnTitle, expectedText) => {
  cy.contains('th', columnTitle)
    .invoke('index')
    .then((columnIndex) => {
      cy.get('tbody tr').each(($row) => {
        cy.wrap($row)
          .find('td')
          .eq(columnIndex)
          .should('have.text', expectedText);
      });
    });
};

// ---------------------------------------------------------------------- tests

describe('InventoryViews app-services filters', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub = createFetchStub();
    cy.viewport(1280, 800);
  });

  describe('Columns', () => {
    it('shows the column backing each filter under test', () => {
      mountTable();

      [
        'Recommendations',
        'Incidents',
        'Vulnerabilities',
        'CVEs with known exploits',
        'CVEs with security rules',
      ].forEach((title) => cy.contains('th', title).should('be.visible'));
    });
  });

  describe('Vulnerability severity (cve_severity)', () => {
    it('returns only systems with critical CVEs', () => {
      mountTable();
      chooseFilterOption('cveSeverity', 'Critical');

      expectRequestedFilters({ cveSeverity: ['critical'] });
      expectVisibleSystems(['vuln-critical', 'vuln-exploit-and-rule']);
      expectSystemsAbsent(['vuln-low', 'vuln-important', 'no-app-data']);
    });

    it('ORs multiple severities together', () => {
      mountTable();
      chooseFilterOption('cveSeverity', 'Critical');
      chooseFilterOption('cveSeverity', 'Low');

      expectRequestedFilters((params) => {
        expect(params.cveSeverity).to.have.members(['critical', 'low']);
      });
      expectVisibleSystems([
        'vuln-critical',
        'vuln-low',
        'vuln-exploit-and-rule',
      ]);
      expectSystemsAbsent(['vuln-important']);
    });
  });

  describe('Known exploit (known_exploit)', () => {
    it('has_known_exploit returns only systems with exploited CVEs', () => {
      mountTable();
      chooseFilterOption('knownExploit', 'Has a known exploit');

      expectRequestedFilters({
        knownExploit: 'has_known_exploit',
      });
      expectVisibleSystems(['vuln-exploit-and-rule']);
    });

    it('no_known_exploit excludes systems with no vulnerability data', () => {
      mountTable();
      chooseFilterOption('knownExploit', 'No known exploit');

      expectRequestedFilters({
        knownExploit: 'no_known_exploit',
      });
      expectVisibleSystems(['vuln-critical', 'vuln-low', 'vuln-important']);
      // NULL app data is excluded from the negative option too.
      expectSystemsAbsent(['no-app-data', 'vuln-exploit-and-rule']);
      // Every row left reads 0, not `--`: having vulnerability data with zero
      // exploits is what the filter selects, not having no data at all.
      expectColumnCells('CVEs with known exploits', '0');
    });
  });

  describe('CVEs with security rules (security_rule)', () => {
    it('present returns only systems with security rules', () => {
      mountTable();
      chooseFilterOption('securityRule', 'Present');

      expectRequestedFilters({ securityRule: 'present' });
      expectVisibleSystems(['vuln-exploit-and-rule']);
    });

    it('not_present excludes systems with no vulnerability data', () => {
      mountTable();
      chooseFilterOption('securityRule', 'Not present');

      expectRequestedFilters({ securityRule: 'not_present' });
      expectVisibleSystems(['vuln-critical', 'vuln-low', 'vuln-important']);
      expectSystemsAbsent(['no-app-data', 'vuln-exploit-and-rule']);
      // 0 rather than `--`: zero security rules, not absent vulnerability data.
      expectColumnCells('CVEs with security rules', '0');
    });
  });

  describe('Recommendation severity (recommendation_severity)', () => {
    it('returns only systems with critical recommendations', () => {
      mountTable();
      chooseFilterOption('recommendationSeverity', 'Critical');

      expectRequestedFilters({
        recommendationSeverity: ['critical'],
      });
      expectVisibleSystems(['adv-critical-incident', 'adv-critical-clean']);
      expectSystemsAbsent(['adv-low-incident', 'no-app-data']);
    });
  });

  describe('Incidents (incident_status)', () => {
    it('incident returns only systems with incidents', () => {
      mountTable();
      chooseFilterOption('incidentStatus', 'Has incidents');

      expectRequestedFilters({ incidentStatus: 'incident' });
      expectVisibleSystems(['adv-critical-incident', 'adv-low-incident']);
    });

    it('no_incident excludes systems with no advisor data', () => {
      mountTable();
      chooseFilterOption('incidentStatus', 'No incidents');

      expectRequestedFilters({
        incidentStatus: 'no_incident',
      });
      expectVisibleSystems(['adv-critical-clean']);
      expectSystemsAbsent(['no-app-data', 'adv-critical-incident']);
      // Same distinction on the advisor side: 0 incidents, not absent data.
      expectColumnCells('Incidents', '0');
    });
  });

  describe('Combining filters', () => {
    it('ANDs advisor severity with incident status', () => {
      mountTable();
      chooseFilterOption('recommendationSeverity', 'Critical');
      chooseFilterOption('incidentStatus', 'Has incidents');

      expectRequestedFilters({
        recommendationSeverity: ['critical'],
        incidentStatus: 'incident',
      });
      expectVisibleSystems(['adv-critical-incident']);
      expectSystemsAbsent(['adv-critical-clean', 'adv-low-incident']);
    });

    it('ANDs across advisor and vulnerability, yielding an empty table', () => {
      mountTable();
      chooseFilterOption('recommendationSeverity', 'Critical');
      chooseFilterOption('cveSeverity', 'Critical');

      // No mocked system carries both advisor and vulnerability data.
      cy.contains('No matching systems found').should('be.visible');
    });
  });

  describe('Clearing filters', () => {
    it('removing the label restores the unfiltered list', () => {
      mountTable();
      chooseFilterOption('cveSeverity', 'Critical');
      expectVisibleSystems(['vuln-critical', 'vuln-exploit-and-rule']);

      removeFilterLabel('Critical');

      expectRequestedFilters((params) => {
        expect(params).to.not.have.property('cveSeverity');
      });
      cy.get('tbody tr').should('have.length', MOCK_SYSTEMS.length);
    });
  });
});
