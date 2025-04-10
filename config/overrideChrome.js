const chromeMock = {
  updateDocumentTitle: () => undefined,
  isBeta: () => false,
  appAction: () => {},
  appObjectId: () => {},
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
  quickStarts: {
    activateQuickstart: () => {},
  },
  on: (e, fn) => {
    if (e === 'GLOBAL_FILTER_UPDATE') {
      fn({ data: {} });
      return () => {};
    }
  },
  mapGlobalFilter: () => {
    return [
      {
        group: {
          name: 'Workloads',
          noFilter: true,
        },
        isSelected: false,
        item: {
          tagKey: 'SAP',
        },
      },
      [],
      [],
    ];
  },
};

export default () => chromeMock;

export const useChrome = () => chromeMock;
