const useChrome = () => ({
  updateDocumentTitle: jest.fn(),
  auth: {
    getUser: () =>
      Promise.resolve({
        identity: {
          account_number: '0',
          type: 'User',
          user: {
            is_org_admin: true,
          },
        },
        entitlements: {
          hybrid_cloud: { is_entitled: true },
          insights: { is_entitled: true },
          openshift: { is_entitled: true },
          smart_management: { is_entitled: false },
        },
      }),
  },
  appAction: jest.fn(),
  appObjectId: jest.fn(),
  on: () => jest.fn(),
  getUserPermissions: () => Promise.resolve(['inventory:*:*']),
  getApp: jest.fn(),
  getBundle: jest.fn(),
  hideGlobalFilter: jest.fn(),
});

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  useChrome,
  default: useChrome,
}));

global.insights = {
  chrome: {
    auth: {
      getUser: () =>
        Promise.resolve({
          identity: {
            account_number: '0',
            type: 'User',
            user: {
              is_org_admin: true,
            },
          },
          entitlements: {
            hybrid_cloud: { is_entitled: true },
            insights: { is_entitled: true },
            openshift: { is_entitled: true },
            smart_management: { is_entitled: false },
          },
        }),
    },
    appAction: jest.fn(),
    appObjectId: jest.fn(),
    on: jest.fn(),
    getUserPermissions: () => Promise.resolve(['inventory:*:*']),
    getApp: jest.fn(),
  },
};

// Make lodash/debounce synchronous in tests to avoid act() timing warnings
jest.mock('lodash/debounce', () => jest.fn((fn) => fn));

// Mock Scalprum so AsyncComponent (and other federated modules) do not throw in tests
jest.mock('@scalprum/react-core', () => ({
  ScalprumComponent: function MockScalprumComponent(props) {
    // eslint-disable-next-line react/prop-types -- test mock; no runtime validation needed
    return props.children ?? null;
  },
}));

// Mock AsyncComponent so federated modules render fallback/error stubs in tests.
// WorkspaceSelector gets an interactive stub; other modules render fallback only.
jest.mock('@redhat-cloud-services/frontend-components/AsyncComponent', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function MockAsyncComponent(props) {
      if (props.module === './modules/WorkspaceSelector') {
        return React.createElement(
          'div',
          { 'data-testid': 'workspace-selector' },
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: () =>
                props.onSelect?.({
                  workspace: { id: 'ws-123', name: 'Test Workspace' },
                }),
            },
            'Select workspace',
          ),
        );
      }

      return React.createElement(
        'div',
        {
          'data-testid': 'async-component-mock',
          'data-module': props.module,
        },
        props.fallback ?? props.ErrorComponent ?? null,
      );
    },
  };
});

// Mock useFeatureFlag so components using useKesselMigrationFeatureFlag (and thus
// useFeatureFlag) do not call @unleash/proxy-client-react's useFlagsStatus(), which
// requires a FlagProvider and causes "flagsReady" errors when missing. Default to
// false (legacy RBAC) so tests behave as before the Kessel migration.
jest.mock('../src/Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(() => false),
  useFeatureVariant: jest.fn(() => ({
    isEnabled: false,
    body: undefined,
    variant: undefined,
    title: undefined,
  })),
}));
