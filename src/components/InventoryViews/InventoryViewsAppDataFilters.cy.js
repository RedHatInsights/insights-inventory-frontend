import SystemsView from '../SystemsView/SystemsView';
import { bindInventoryViewColumns } from '../SystemsView/columns/inventoryViewColumns';
import { bindAdvisorFilters } from '../SystemsView/filters/advisor/bindAdvisorFilters';
import { bindVulnerabilityFilters } from '../SystemsView/filters/vulnerability/bindVulnerabilityFilter';

/*
 * Component tests for the app services toolbar filters on the /hosts/views table.
 *
 * Mocking at the `fetchData` boundary lets us hand the table systems carrying
 * exact app-data counts, instead of uploading hosts or standing up a VM.
 * `applyAppDataFilters` below mirrors the semantics documented per query
 * param on `ApiHostViewsGetHostViewsParams` in the generated client: values
 * within one filter OR, filters AND, and `not_analyzed` / `not_evaluated` match
 * hosts the app never reported on, unlike `not_present`, which needs a reported
 * count of zero. Bumping the client is what moves that contract.
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
  // No app_data at all: the backend treats these as NULL, so they only come back
  // through the "the app never reported on this system" option of each filter.
  makeHost('no-app-data', null),
];

// A system only carries one app's data, so from the other app's point of view it
// is unreported — the same bucket as `no-app-data`.
const NO_ADVISOR_DATA_SYSTEMS = [
  'vuln-critical',
  'vuln-low',
  'vuln-important',
  'vuln-exploit-and-rule',
  'no-app-data',
];

const NO_VULNERABILITY_DATA_SYSTEMS = [
  'adv-critical-incident',
  'adv-critical-clean',
  'adv-low-incident',
  'no-app-data',
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

// Every app-data filter takes a list of values that are OR'd together, and each
// one offers a value for "this app never reported on the system": `not_analyzed`
// on the advisor side, `not_evaluated` on the vulnerability side.
const NO_ADVISOR_DATA = 'not_analyzed';
const NO_VULNERABILITY_DATA = 'not_evaluated';

// critical | important | moderate | low: that severity's count is above zero.
const matchesSeverity = (appData, selected, severityKeys, noDataValue) =>
  selected.some((value) =>
    value === noDataValue
      ? !appData
      : (appData?.[severityKeys[value]] ?? 0) > 0,
  );

// present: the count is above zero. not_present: the app reported, counting zero.
const matchesPresence = (appData, selected, countField, noDataValue) =>
  selected.some((value) => {
    if (value === noDataValue) return !appData;
    if (!appData) return false;
    const count = appData[countField] ?? 0;
    return value === 'present' ? count > 0 : count === 0;
  });

// Filters mocked systems the way the backend filters real ones. Filters AND with
// each other; the values within one filter OR.
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

    if (
      recommendationSeverity?.length &&
      !matchesSeverity(
        adv,
        recommendationSeverity,
        ADVISOR_SEVERITY_KEY,
        NO_ADVISOR_DATA,
      )
    ) {
      return false;
    }

    if (
      incidentStatus?.length &&
      !matchesPresence(adv, incidentStatus, 'incidents', NO_ADVISOR_DATA)
    ) {
      return false;
    }

    if (
      cveSeverity?.length &&
      !matchesSeverity(
        vuln,
        cveSeverity,
        CVE_SEVERITY_KEY,
        NO_VULNERABILITY_DATA,
      )
    ) {
      return false;
    }

    if (
      knownExploit?.length &&
      !matchesPresence(
        vuln,
        knownExploit,
        'cves_with_known_exploits',
        NO_VULNERABILITY_DATA,
      )
    ) {
      return false;
    }

    if (
      securityRule?.length &&
      !matchesPresence(
        vuln,
        securityRule,
        'cves_with_security_rules',
        NO_VULNERABILITY_DATA,
      )
    ) {
      return false;
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
    title: 'CVE severity',
    placeholder: 'Filter by CVE severity',
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

// Activates a filter's attribute, then picks one of its options. Matching the
// label exactly matters now that "Present" and "Not present" share a menu.
const chooseFilterOption = (filterKey, optionLabel) => {
  const { title, placeholder } = FILTERS[filterKey];
  selectFilterAttribute(title);
  cy.contains('button', placeholder).click();
  cy.get('[role="menu"]:visible')
    .contains(new RegExp(`^${optionLabel}$`))
    .click();
  // Every app-data filter is multi-select, so the menu stays open after a pick;
  // close it so the next toggle is clickable.
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

  describe('CVE severity (cve_severity)', () => {
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

    it('not_evaluated returns the systems Vulnerability never reported on', () => {
      mountTable();
      chooseFilterOption('cveSeverity', 'Not evaluated');

      expectRequestedFilters({ cveSeverity: ['not_evaluated'] });
      expectVisibleSystems(NO_VULNERABILITY_DATA_SYSTEMS);
      expectSystemsAbsent(['vuln-critical', 'vuln-exploit-and-rule']);
      // `--` rather than 0: no vulnerability data at all, not a zero count.
      expectColumnCells('CVEs with known exploits', '--');
    });

    it('ORs a severity with not_evaluated', () => {
      mountTable();
      chooseFilterOption('cveSeverity', 'Critical');
      chooseFilterOption('cveSeverity', 'Not evaluated');

      expectRequestedFilters((params) => {
        expect(params.cveSeverity).to.have.members([
          'critical',
          'not_evaluated',
        ]);
      });
      expectVisibleSystems([
        'vuln-critical',
        'vuln-exploit-and-rule',
        ...NO_VULNERABILITY_DATA_SYSTEMS,
      ]);
      expectSystemsAbsent(['vuln-low', 'vuln-important']);
    });
  });

  describe('Known exploit (known_exploit)', () => {
    it('present returns only systems with exploited CVEs', () => {
      mountTable();
      chooseFilterOption('knownExploit', 'Present');

      expectRequestedFilters({ knownExploit: ['present'] });
      expectVisibleSystems(['vuln-exploit-and-rule']);
    });

    it('not_present excludes systems with no vulnerability data', () => {
      mountTable();
      chooseFilterOption('knownExploit', 'Not present');

      expectRequestedFilters({ knownExploit: ['not_present'] });
      expectVisibleSystems(['vuln-critical', 'vuln-low', 'vuln-important']);
      // NULL app data is excluded from the negative option; it has its own.
      expectSystemsAbsent(['no-app-data', 'vuln-exploit-and-rule']);
      // Every row left reads 0, not `--`: having vulnerability data with zero
      // exploits is what the filter selects, not having no data at all.
      expectColumnCells('CVEs with known exploits', '0');
    });

    it('not_evaluated returns the systems Vulnerability never reported on', () => {
      mountTable();
      chooseFilterOption('knownExploit', 'Not evaluated');

      expectRequestedFilters({ knownExploit: ['not_evaluated'] });
      expectVisibleSystems(NO_VULNERABILITY_DATA_SYSTEMS);
      expectColumnCells('CVEs with known exploits', '--');
    });

    it('ORs present with not_evaluated', () => {
      mountTable();
      chooseFilterOption('knownExploit', 'Present');
      chooseFilterOption('knownExploit', 'Not evaluated');

      expectRequestedFilters((params) => {
        expect(params.knownExploit).to.have.members([
          'present',
          'not_evaluated',
        ]);
      });
      expectVisibleSystems([
        'vuln-exploit-and-rule',
        ...NO_VULNERABILITY_DATA_SYSTEMS,
      ]);
      // Reported zero exploits, so neither side of the OR picks them up.
      expectSystemsAbsent(['vuln-critical', 'vuln-low', 'vuln-important']);
    });
  });

  describe('CVEs with security rules (security_rule)', () => {
    it('present returns only systems with security rules', () => {
      mountTable();
      chooseFilterOption('securityRule', 'Present');

      expectRequestedFilters({ securityRule: ['present'] });
      expectVisibleSystems(['vuln-exploit-and-rule']);
    });

    it('not_present excludes systems with no vulnerability data', () => {
      mountTable();
      chooseFilterOption('securityRule', 'Not present');

      expectRequestedFilters({ securityRule: ['not_present'] });
      expectVisibleSystems(['vuln-critical', 'vuln-low', 'vuln-important']);
      expectSystemsAbsent(['no-app-data', 'vuln-exploit-and-rule']);
      // 0 rather than `--`: zero security rules, not absent vulnerability data.
      expectColumnCells('CVEs with security rules', '0');
    });

    it('not_evaluated returns the systems Vulnerability never reported on', () => {
      mountTable();
      chooseFilterOption('securityRule', 'Not evaluated');

      expectRequestedFilters({ securityRule: ['not_evaluated'] });
      expectVisibleSystems(NO_VULNERABILITY_DATA_SYSTEMS);
      expectColumnCells('CVEs with security rules', '--');
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

    it('not_analyzed returns the systems Advisor never reported on', () => {
      mountTable();
      chooseFilterOption('recommendationSeverity', 'Not analyzed');

      expectRequestedFilters({
        recommendationSeverity: ['not_analyzed'],
      });
      expectVisibleSystems(NO_ADVISOR_DATA_SYSTEMS);
      expectSystemsAbsent(['adv-critical-incident', 'adv-low-incident']);
      expectColumnCells('Incidents', '--');
    });
  });

  describe('Incidents (incident_status)', () => {
    it('present returns only systems with incidents', () => {
      mountTable();
      chooseFilterOption('incidentStatus', 'Present');

      expectRequestedFilters({ incidentStatus: ['present'] });
      expectVisibleSystems(['adv-critical-incident', 'adv-low-incident']);
    });

    it('not_present excludes systems with no advisor data', () => {
      mountTable();
      chooseFilterOption('incidentStatus', 'Not present');

      expectRequestedFilters({
        incidentStatus: ['not_present'],
      });
      expectVisibleSystems(['adv-critical-clean']);
      expectSystemsAbsent(['no-app-data', 'adv-critical-incident']);
      // Same distinction on the advisor side: 0 incidents, not absent data.
      expectColumnCells('Incidents', '0');
    });

    it('not_analyzed returns the systems Advisor never reported on', () => {
      mountTable();
      chooseFilterOption('incidentStatus', 'Not analyzed');

      expectRequestedFilters({ incidentStatus: ['not_analyzed'] });
      expectVisibleSystems(NO_ADVISOR_DATA_SYSTEMS);
      expectColumnCells('Incidents', '--');
    });

    it('ORs not_present with not_analyzed', () => {
      mountTable();
      chooseFilterOption('incidentStatus', 'Not present');
      chooseFilterOption('incidentStatus', 'Not analyzed');

      expectRequestedFilters((params) => {
        expect(params.incidentStatus).to.have.members([
          'not_present',
          'not_analyzed',
        ]);
      });
      expectVisibleSystems(['adv-critical-clean', ...NO_ADVISOR_DATA_SYSTEMS]);
      expectSystemsAbsent(['adv-critical-incident', 'adv-low-incident']);
    });
  });

  describe('Combining filters', () => {
    it('ANDs advisor severity with incident status', () => {
      mountTable();
      chooseFilterOption('recommendationSeverity', 'Critical');
      chooseFilterOption('incidentStatus', 'Present');

      expectRequestedFilters({
        recommendationSeverity: ['critical'],
        incidentStatus: ['present'],
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
