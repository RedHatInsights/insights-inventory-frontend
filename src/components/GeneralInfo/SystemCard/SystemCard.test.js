import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import configureStore from 'redux-mock-store';
import promiseMiddleware from 'redux-promise-middleware';
import mockedData from '../../../__mocks__/mockedData.json';
import { rhsmFacts, testProperties } from '../../../__mocks__/selectors';
import SystemCard from './SystemCard';
import { TestWrapper } from '../../../Utilities/TestingUtilities';
import { hostInventoryApi } from '../../../api/hostInventoryApi';
import { mockWorkloadsData } from '../dataMapper/dataMapper.test';

const fields = [
  'Host name',
  'Display name',
  'Ansible hostname',
  'Workspace',
  'Workloads',
  'System purpose',
  'Number of CPUs',
  'Sockets',
  'Cores per socket',
  'CPU flags',
  'RAM',
];

const mock = new MockAdapter(hostInventoryApi.axios, {
  onNoMatch: 'throwException',
});

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  })
);

describe('SystemCard', () => {
  let initialState;
  let mockStore;

  beforeEach(() => {
    mockStore = configureStore([promiseMiddleware]);
    mock
      .onGet('/api/inventory/v1/hosts/test-id/system_profile')
      .reply(200, mockedData);
    mock.onGet('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
    mock.onGet('/api/inventory/v1/hosts/test-id/system_profile?fields%5Bsystem_profile%5D%5B%5D=operating_system').reply(200, mockedData); // eslint-disable-line

    location.pathname = 'localhost:3000/example/path';

    initialState = {
      entityDetails: {
        entity: {
          display_name: 'test-display-name',
          ansible_host: 'test-ansible-host',
          id: 'test-id',
          facts: {
            rhsm: rhsmFacts,
          },
        },
      },
      systemProfileStore: {
        systemProfile: {
          loaded: true,
          ...testProperties,
        },
      },
    };
  });

  it('should render correctly - no data', () => {
    render(
      <TestWrapper
        store={mockStore({ systemProfileStore: {}, entityDetails: {} })}
      >
        <SystemCard />
      </TestWrapper>
    );

    screen.getByRole('heading', {
      name: /system properties/i,
    });
    fields.forEach(screen.getByText);
    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual(['', '', '', '', '', '', '', '', '', '', '']);
    screen.getByRole('button', {
      name: /action for host name/i,
    });
    screen.getByRole('button', {
      name: /action for display name/i,
    });
    screen.getByRole('button', {
      name: /action for ansible hostname/i,
    });
  });

  it('should render correctly with data', () => {
    render(
      <TestWrapper store={mockStore(initialState)}>
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'Not available',
      'test-display-name',
      'test-ansible-host',
      'Not available',
      'Not available',
      'Production',
      '1',
      '1',
      '1',
      '0 flags',
      '5 MB',
    ]);
  });

  it('should render correctly with Workspace', () => {
    render(
      <TestWrapper
        store={mockStore({
          entityDetails: {
            entity: {
              ...initialState.entityDetails.entity,
              groups: [
                {
                  id: 'your_favourite_uuid',
                  name: 'workspace_name',
                },
              ],
            },
          },
          systemProfileStore: {
            ...initialState.systemProfileStore,
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(screen.getByText('workspace_name')).toBeInTheDocument();
    expect(screen.getByText('workspace_name')).toHaveAttribute(
      'href',
      '//inventory/workspaces/your_favourite_uuid'
    );
  });

  it('should render correctly with rhsm facts', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'Not available',
      'test-display-name',
      'test-ansible-host',
      'Not available',
      'Not available',
      'Not available',
      '2',
      '1',
      '2',
      'Not available',
      '2 GB',
    ]);
  });

  describe('API', () => {
    it('should calculate correct ansible host - direct ansible host', () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard />
        </TestWrapper>
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-ansible-host');
    });

    it('should calculate correct ansible host - from fqdn', () => {
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            entityDetails: {
              entity: {
                ...initialState.entity,
                ansible_host: undefined,
                fqdn: 'test-fqdn',
              },
            },
          })}
        >
          <SystemCard />
        </TestWrapper>
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-fqdn');
    });

    it('should calculate correct ansible host - from id', () => {
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            entityDetails: {
              entity: {
                ...initialState.entity,
                ansible_host: undefined,
                id: 'test-id',
              },
            },
          })}
        >
          <SystemCard />
        </TestWrapper>
      );

      expect(
        screen.getByRole('definition', {
          name: /ansible hostname value/i,
        })
      ).toHaveTextContent('test-id');
    });

    it('should show edit display name', async () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard />
        </TestWrapper>
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /display name value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );

      screen.getByRole('heading', {
        name: /edit display name/i,
      });
      screen.getByRole('textbox', {
        name: /host inventory display name/i,
      });
    });

    it('should show edit ansible hostname', async () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard />
        </TestWrapper>
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /ansible hostname value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );

      screen.getByRole('heading', {
        name: /edit ansible host/i,
      });
      screen.getByRole('textbox', {
        name: /ansible host/i,
      });
    });

    it('should not call edit display name actions', async () => {
      mock.onPatch('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
      mock
        .onGet('/api/inventory/v1/hosts/test-id/system_profile')
        .reply(200, mockedData);
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <SystemCard />
        </TestWrapper>
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /display name value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );
      expect(store.getActions().length).toBe(0); // the button is disabled since the input hasn't been changed
    });

    it('should not call edit ansible hostname actions', async () => {
      mock.onPatch('/api/inventory/v1/hosts/test-id').reply(200, mockedData);
      mock
        .onGet('/api/inventory/v1/hosts/test-id/system_profile')
        .reply(200, mockedData);
      const store = mockStore(initialState);
      render(
        <TestWrapper store={store}>
          <SystemCard />
        </TestWrapper>
      );

      await userEvent.click(
        within(
          screen.getByRole('definition', {
            name: /ansible hostname value/i,
          })
        ).getByRole('img', {
          hidden: true,
        })
      );
      expect(store.getActions().length).toBe(0); // the button is disabled since the input hasn't been changed
    });

    it('should handle click on cpu flags identifiers', async () => {
      const handleClick = jest.fn();
      render(
        <TestWrapper
          store={mockStore({
            ...initialState,
            systemProfileStore: {
              systemProfile: {
                loaded: true,
                ...testProperties,
                cpu_flags: ['flag_1', 'flag_2'],
              },
            },
          })}
          routerProps={{ initialEntries: ['/example/flag'] }}
        >
          <SystemCard handleClick={handleClick} />
        </TestWrapper>
      );

      await userEvent.click(
        screen.getByRole('link', {
          name: /2 flags/i,
        })
      );
      expect(handleClick).toHaveBeenCalledWith('CPU flags', {
        cells: [
          {
            title: 'flag name',
            transforms: expect.any(Array),
          },
        ],
        filters: [{ type: 'text' }],
        rows: [['flag_1'], ['flag_2']],
      });
    });
  });

  /* [
    'hasHostName',
    'hasDisplayName',
    'hasAnsibleHostname',
    'hasWorkspace',
    'hasSystemPurpose',
    'hasCPUs',
    'hasSockets',
    'hasCores',
    'hasCPUFlags',
    'hasRAM',
  ].map((item, index) =>
    it(`should not render ${item}`, () => {
      render(
        <TestWrapper store={mockStore(initialState)}>
          <SystemCard {...{ [item]: false }} />
        </TestWrapper>
      );
      screen.logTestingPlaygroundURL()

      expect(screen.queryByText(fields[index])).not.toBeInTheDocument();
    })
  ); */

  it('should render extra', () => {
    render(
      <TestWrapper store={mockStore(initialState)}>
        <SystemCard
          extra={[
            { title: 'something', value: 'test' },
            {
              title: 'with click',
              value: '1 tests',
              onClick: (_e, handleClick) =>
                handleClick('Something', {}, 'small'),
            },
          ]}
        />
      </TestWrapper>
    );

    expect(
      screen.getAllByRole('definition').map((element) => element.textContent)
    ).toEqual([
      'Not available',
      'test-display-name',
      'test-ansible-host',
      'Not available',
      'Not available',
      'Production',
      '1',
      '1',
      '1',
      '0 flags',
      '5 MB',
      'test',
      '1 tests',
    ]);
  });

  it('should render correctly with SAP workload', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                sap: {
                  instance_number:
                    'j2r1MRNe49og, df.lWNAV._m_2sbl, KAS1MYAqXXqGIirplJG',
                  sap_system: true,
                  sids: [
                    'FudUaJbpiPfLVJkNUT.F, 2DSO9DmPKg30, Vx-jCe1ibHTHj01A',
                  ],
                  version: 'ezU7Htkuo, GU_aiKHi52n7PFH, ONRu1Ku4_skoUXrR',
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('SAP');
  });

  it('should render correctly with Ansible workload', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                ansible: {
                  catalog_worker_version: '9.8.7, banana.42, 0.0.abc',
                  controller_version: 'x.1.2, foo.bar, 3.3.3',
                  hub_version: 'abc.def, 123.456, xyz.789',
                  sso_version: 'preview-1, glitch.9.9, zz-top.7',
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('Ansible Automation Platform');
  });

  it('should render correctly with RHEL AI workload', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                rhel_ai: {
                  amd_gpu_models: ['Quantum Spark GT, Mangoburst 900X'],
                  intel_gaudi_hpu_models: [
                    'Turbo Flux HL-Ω1, Gaudi++ Phantom Edition',
                  ],
                  nvidia_gpu_models: ['RTX Hypernova 12X, GX-99π Phantom'],
                  rhel_ai_version_id: 'vX.Y.Z-beta',
                  variant: 'RHEL AI Galactic',
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('RHEL AI');
  });

  it('should render correctly with InterSystems workload', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                intersystems: {
                  is_intersystems: true,
                  running_instances: [
                    {
                      instance_name: 'NOVA-X, ENV-Δ42',
                      product: 'HyperIRIS',
                      version: '3021.∞, nebula.7',
                    },
                  ],
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('InterSystems');
  });

  it('should render correctly with IBM Db2 workload failed', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                ibm_db2: {
                  is_running: false,
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('IBM Db2 Failed');
  });

  it('should render correctly with IBM Db2 workload running', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                ibm_db2: {
                  is_running: true,
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('IBM Db2 Running');
  });

  it('should render correctly with CrowdStrike workload', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                crowdstrike: {
                  falcon_aid: 'xfoCshFVO6TwXdGHvy',
                  falcon_backend:
                    'dOqLegz0W8159Q0X2, fNbEf-pmK, r1zrECSYr_FgUDMbIu2',
                  falcon_version: 'lsSRGjjnhpl2Cz-, -KPJKI_kSyHVP5khj',
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );
    screen.logTestingPlaygroundURL();

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('CrowdStrike');
  });

  it('should render correctly with Microsoft SQL workload', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                mssql: {
                  version: 'nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL',
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('Microsoft SQL');
  });

  it('should render correctly with Oracle Database workload failed', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                oracle_db: {
                  is_running: false,
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('Oracle Database Failed');
  });

  it('should render correctly with Oracle Database workload running', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                oracle_db: {
                  is_running: true,
                },
              },
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent('Oracle Database Running');
  });

  it('should render correctly with every Workload', () => {
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: mockWorkloadsData,
            },
          },
        })}
      >
        <SystemCard />
      </TestWrapper>
    );

    expect(
      screen.getByRole('definition', {
        name: /Workloads value/i,
      })
    ).toHaveTextContent(
      'SAP, Ansible Automation Platform, Microsoft SQL, CrowdStrike, RHEL AI, InterSystems, IBM Db2 Failed, Oracle Database Failed'
    );
  });

  it('should handle click on SAP Workloads', async () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                sap: {
                  instance_number:
                    'j2r1MRNe49og, df.lWNAV._m_2sbl, KAS1MYAqXXqGIirplJG',
                  sap_system: true,
                  sids: [
                    'FudUaJbpiPfLVJkNUT.F, 2DSO9DmPKg30, Vx-jCe1ibHTHj01A',
                  ],
                  version: 'ezU7Htkuo, GU_aiKHi52n7PFH, ONRu1Ku4_skoUXrR',
                },
              },
            },
          },
        })}
        routerProps={{ initialEntries: ['/example/sap_sids'] }}
      >
        <SystemCard handleClick={handleClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('link', {
        name: /SAP/i,
      })
    );
    expect(handleClick).toHaveBeenCalledWith('SAP IDs (SID)', {
      cells: [
        {
          title: 'SID',
          transforms: expect.any(Array),
        },
      ],
      filters: [{ type: 'text' }],
      rows: [['FudUaJbpiPfLVJkNUT.F, 2DSO9DmPKg30, Vx-jCe1ibHTHj01A']],
    });
  });

  it('should handle click on Ansible Workloads', async () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                ansible: {
                  catalog_worker_version: '9.8.7, banana.42, 0.0.abc',
                  controller_version: 'x.1.2, foo.bar, 3.3.3',
                  hub_version: 'abc.def, 123.456, xyz.789',
                  sso_version: 'preview-1, glitch.9.9, zz-top.7',
                },
              },
            },
          },
        })}
        routerProps={{ initialEntries: ['/example/ansible'] }}
      >
        <SystemCard handleClick={handleClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('link', {
        name: /Ansible Automation Platform/i,
      })
    );
    expect(handleClick).toHaveBeenCalledWith('Ansible', {
      cells: [
        { title: 'Catalog Worker Version' },
        { title: 'Controller Version' },
        { title: 'Hub Version' },
        { title: 'Sso Version' },
      ],
      filters: [{ type: 'text' }],
      rows: [
        [
          '9.8.7, banana.42, 0.0.abc',
          'x.1.2, foo.bar, 3.3.3',
          'abc.def, 123.456, xyz.789',
          'preview-1, glitch.9.9, zz-top.7',
        ],
      ],
    });
  });

  it('should handle click on RHEL AI Workloads', async () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                rhel_ai: {
                  amd_gpu_models: ['Quantum Spark GT, Mangoburst 900X'],
                  intel_gaudi_hpu_models: [
                    'Turbo Flux HL-Ω1, Gaudi++ Phantom Edition',
                  ],
                  nvidia_gpu_models: ['RTX Hypernova 12X, GX-99π Phantom'],
                  rhel_ai_version_id: 'vX.Y.Z-beta',
                  variant: 'RHEL AI Galactic',
                },
              },
            },
          },
        })}
        routerProps={{ initialEntries: ['/example/rhel_ai'] }}
      >
        <SystemCard handleClick={handleClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('link', {
        name: /RHEL AI/i,
      })
    );
    expect(handleClick).toHaveBeenCalledWith('RHEL AI', {
      cells: [
        { title: 'Amd Gpu Models' },
        { title: 'Intel Gaudi Hpu Models' },
        { title: 'Nvidia Gpu Models' },
        { title: 'Rhel Ai Version Id' },
        { title: 'Variant' },
      ],
      filters: [{ type: 'text' }],
      rows: [
        [
          'Quantum Spark GT, Mangoburst 900X',
          'Turbo Flux HL-Ω1, Gaudi++ Phantom Edition',
          'RTX Hypernova 12X, GX-99π Phantom',
          'vX.Y.Z-beta',
          'RHEL AI Galactic',
        ],
      ],
    });
  });

  it('should handle click on InterSystems Workloads', async () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                intersystems: {
                  is_intersystems: true,
                  running_instances: [
                    {
                      instance_name: 'NOVA-X, ENV-Δ42',
                      product: 'HyperIRIS',
                      version: '3021.∞, nebula.7',
                    },
                  ],
                },
              },
            },
          },
        })}
        routerProps={{ initialEntries: ['/example/intersystems'] }}
      >
        <SystemCard handleClick={handleClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('link', {
        name: /InterSystems/i,
      })
    );
    expect(handleClick).toHaveBeenCalledWith('InterSystems', {
      cells: [
        { title: 'Instance Name' },
        { title: 'Product' },
        { title: 'Version' },
      ],
      filters: [{ type: 'text' }],
      rows: [['NOVA-X, ENV-Δ42', 'HyperIRIS', '3021.∞, nebula.7']],
    });
  });

  it('should handle click on CrowdStrike Workloads', async () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                crowdstrike: {
                  falcon_aid: 'xfoCshFVO6TwXdGHvy',
                  falcon_backend:
                    'dOqLegz0W8159Q0X2, fNbEf-pmK, r1zrECSYr_FgUDMbIu2',
                  falcon_version: 'lsSRGjjnhpl2Cz-, -KPJKI_kSyHVP5khj',
                },
              },
            },
          },
        })}
        routerProps={{ initialEntries: ['/example/crowdstrike'] }}
      >
        <SystemCard handleClick={handleClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('link', {
        name: /CrowdStrike/i,
      })
    );
    expect(handleClick).toHaveBeenCalledWith('CrowdStrike', {
      cells: [
        { title: 'Falcon Aid' },
        { title: 'Falcon Backend' },
        { title: 'Falcon Version' },
      ],
      filters: [{ type: 'text' }],
      rows: [
        [
          'xfoCshFVO6TwXdGHvy',
          'dOqLegz0W8159Q0X2, fNbEf-pmK, r1zrECSYr_FgUDMbIu2',
          'lsSRGjjnhpl2Cz-, -KPJKI_kSyHVP5khj',
        ],
      ],
    });
  });

  it('should handle click on Microsoft SQL', async () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                mssql: {
                  version: 'nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL',
                },
              },
            },
          },
        })}
        routerProps={{ initialEntries: ['/example/mssql'] }}
      >
        <SystemCard handleClick={handleClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('link', {
        name: /Microsoft SQL/i,
      })
    );
    expect(handleClick).toHaveBeenCalledWith('Microsoft SQL', {
      cells: [{ title: 'Value' }],
      filters: [{ type: 'text' }],
      rows: [['nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL']],
    });
  });

  it('should handle click on Microsoft SQL', async () => {
    const handleClick = jest.fn();
    render(
      <TestWrapper
        store={mockStore({
          ...initialState,
          systemProfileStore: {
            systemProfile: {
              loaded: true,
              ...testProperties,
              workloads: {
                mssql: {
                  version: 'nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL',
                },
              },
            },
          },
        })}
        routerProps={{ initialEntries: ['/example/mssql'] }}
      >
        <SystemCard handleClick={handleClick} />
      </TestWrapper>
    );

    await userEvent.click(
      screen.getByRole('link', {
        name: /Microsoft SQL/i,
      })
    );
    expect(handleClick).toHaveBeenCalledWith('Microsoft SQL', {
      cells: [{ title: 'Value' }],
      filters: [{ type: 'text' }],
      rows: [['nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL']],
    });
  });
});
