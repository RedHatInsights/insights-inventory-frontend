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

global.IS_DEV = true;
