const chromeMock = {
  updateDocumentTitle: () => undefined,
  isBeta: () => false,
  appAction: () => {},
  appObjectId: () => {},
  on: () => () => {},
  getApp: () => 'inventory',
  getBundle: () => 'insights',
  getUserPermissions: () => [{ permission: 'inventory:*:*' }],
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
  hideGlobalFilter: () => {},
};

export default () => chromeMock;

export const useChrome = () => chromeMock;
