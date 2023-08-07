export const systemStalenessItems = (activeTabKey) => {
  return [
    {
      name: '1 day',
      value: 1,
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
      title: 'System Satleness',
    },
    {
      name: '2 days',
      value: 2,
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '3 days',
      value: 3,
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '4 days',
      value: 4,
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '5 days',
      value: 5,
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '6 days',
      value: 6,
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: '7 days',
      value: 7,
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
    {
      name: 'Never',
      value: 'Never',
      apiKey: activeTabKey ? 'edge_staleness_delta' : 'system_staleness_delta',
    },
  ];
};

export const systemStalenessWarningItems = (activeTabKey) => {
  return [
    {
      name: '7 day',
      value: 7,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
      title: 'System stale warning',
    },
    {
      name: '14 days',
      value: 12,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: '21 days',
      value: 21,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: '30 days',
      value: 20,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: '60 days',
      value: 60,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: '90 days',
      value: 90,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: '120 days',
      value: 120,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: '150 days',
      value: 150,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: '180 days',
      value: 180,
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
    {
      name: 'Never',
      value: 'Never',
      apiKey: activeTabKey
        ? 'system_stale_warning_delta'
        : 'edge_stale_warning_delta',
    },
  ];
};

export const systemCullingItems = (activeTabKey) => {
  return [
    {
      name: '14 days',
      value: 14,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
      title: 'System culling',
    },
    {
      name: '21 days',
      value: 21,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '30 days',
      value: 20,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '60 days',
      value: 60,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '90 days',
      value: 90,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '120 days',
      value: 120,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '150 days',
      value: 150,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: '180 days',
      value: 180,
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
    {
      name: 'Never',
      value: 'Never',
      apiKey: activeTabKey ? 'edge_culling_delta' : 'system_culling_delta',
    },
  ];
};
