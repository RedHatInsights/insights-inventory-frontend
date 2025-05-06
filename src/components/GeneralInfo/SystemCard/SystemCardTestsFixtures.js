export const workloadClickTestCases = [
  {
    name: 'SAP',
    linkText: /SAP/i,
    workloads: {
      sap: {
        instance_number: 'j2r1MRNe49og, df.lWNAV._m_2sbl, KAS1MYAqXXqGIirplJG',
        sap_system: true,
        sids: ['FudUaJbpiPfLVJkNUT.F, 2DSO9DmPKg30, Vx-jCe1ibHTHj01A'],
        version: 'ezU7Htkuo, GU_aiKHi52n7PFH, ONRu1Ku4_skoUXrR',
      },
    },
    expectedClickTitle: 'SAP IDs (SID)',
    expectedData: {
      cells: [
        {
          title: 'SID',
          transforms: expect.any(Array),
        },
      ],
      filters: [{ type: 'text' }],
      rows: [['FudUaJbpiPfLVJkNUT.F, 2DSO9DmPKg30, Vx-jCe1ibHTHj01A']],
    },
  },
  {
    name: 'Ansible Automation Platform',
    linkText: /Ansible Automation Platform/i,
    workloads: {
      ansible: {
        catalog_worker_version: '9.8.7, banana.42, 0.0.abc',
        controller_version: 'x.1.2, foo.bar, 3.3.3',
        hub_version: 'abc.def, 123.456, xyz.789',
        sso_version: 'preview-1, glitch.9.9, zz-top.7',
      },
    },
    expectedClickTitle: 'Ansible Automation Platform',
    expectedData: {
      cells: [
        { title: 'Catalog worker version' },
        { title: 'Controller version' },
        { title: 'Hub version' },
        { title: 'SSO version' },
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
    },
  },
  {
    name: 'RHEL AI',
    linkText: /RHEL AI/i,
    workloads: {
      rhel_ai: {
        amd_gpu_models: ['Quantum Spark GT, Mangoburst 900X'],
        intel_gaudi_hpu_models: ['Turbo Flux HL-Ω1, Gaudi++ Phantom Edition'],
        nvidia_gpu_models: ['RTX Hypernova 12X, GX-99π Phantom'],
        rhel_ai_version_id: 'vX.Y.Z-beta',
        variant: 'RHEL AI Galactic',
      },
    },
    expectedClickTitle: 'RHEL AI',
    expectedData: {
      cells: [
        { title: 'AMD GPU models' },
        { title: 'Intel Gaudi HPU models' },
        { title: 'Nvidia GPU models' },
        { title: 'RHEL AI version ID' },
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
    },
  },
  {
    name: 'InterSystems',
    linkText: /InterSystems/i,
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
    expectedClickTitle: 'InterSystems',
    expectedData: {
      cells: [
        { title: 'Instance name' },
        { title: 'Product' },
        { title: 'Version' },
      ],
      filters: [{ type: 'text' }],
      rows: [['NOVA-X, ENV-Δ42', 'HyperIRIS', '3021.∞, nebula.7']],
    },
  },
  {
    name: 'CrowdStrike',
    linkText: /CrowdStrike/i,
    workloads: {
      crowdstrike: {
        falcon_aid: 'xfoCshFVO6TwXdGHvy',
        falcon_backend: 'dOqLegz0W8159Q0X2, fNbEf-pmK, r1zrECSYr_FgUDMbIu2',
        falcon_version: 'lsSRGjjnhpl2Cz-, -KPJKI_kSyHVP5khj',
      },
    },
    expectedClickTitle: 'CrowdStrike',
    expectedData: {
      cells: [
        { title: 'Falcon AID' },
        { title: 'Falcon backend' },
        { title: 'Falcon version' },
      ],
      filters: [{ type: 'text' }],
      rows: [
        [
          'xfoCshFVO6TwXdGHvy',
          'dOqLegz0W8159Q0X2, fNbEf-pmK, r1zrECSYr_FgUDMbIu2',
          'lsSRGjjnhpl2Cz-, -KPJKI_kSyHVP5khj',
        ],
      ],
    },
  },
  {
    name: 'Microsoft SQL',
    linkText: /Microsoft SQL/i,
    workloads: {
      mssql: {
        version: 'nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL',
      },
    },
    expectedClickTitle: 'Microsoft SQL',
    expectedData: {
      cells: [{ title: 'Value' }],
      filters: [{ type: 'text' }],
      rows: [['nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL']],
    },
  },
];

export const workloadTestCases = [
  {
    name: 'SAP',
    workloads: {
      sap: {
        instance_number: 'j2r1MRNe49og, df.lWNAV._m_2sbl, KAS1MYAqXXqGIirplJG',
        sap_system: true,
        sids: ['FudUaJbpiPfLVJkNUT.F, 2DSO9DmPKg30, Vx-jCe1ibHTHj01A'],
        version: 'ezU7Htkuo, GU_aiKHi52n7PFH, ONRu1Ku4_skoUXrR',
      },
    },
    expectedText: 'SAP',
  },
  {
    name: 'Ansible',
    workloads: {
      ansible: {
        catalog_worker_version: '9.8.7, banana.42, 0.0.abc',
        controller_version: 'x.1.2, foo.bar, 3.3.3',
        hub_version: 'abc.def, 123.456, xyz.789',
        sso_version: 'preview-1, glitch.9.9, zz-top.7',
      },
    },
    expectedText: 'Ansible Automation Platform',
  },
  {
    name: 'RHEL AI',
    workloads: {
      rhel_ai: {
        amd_gpu_models: ['Quantum Spark GT, Mangoburst 900X'],
        intel_gaudi_hpu_models: ['Turbo Flux HL-Ω1, Gaudi++ Phantom Edition'],
        nvidia_gpu_models: ['RTX Hypernova 12X, GX-99π Phantom'],
        rhel_ai_version_id: 'vX.Y.Z-beta',
        variant: 'RHEL AI Galactic',
      },
    },
    expectedText: 'RHEL AI',
  },
  {
    name: 'InterSystems',
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
    expectedText: 'InterSystems',
  },
  {
    name: 'IBM Db2',
    workloads: {
      ibm_db2: {
        is_running: true,
      },
    },
    expectedText: 'IBM Db2',
  },
  {
    name: 'IBM Db2',
    workloads: {
      ibm_db2: {
        is_running: false,
      },
    },
    expectedText: 'IBM Db2',
  },
  {
    name: 'CrowdStrike',
    workloads: {
      crowdstrike: {
        falcon_aid: 'xfoCshFVO6TwXdGHvy',
        falcon_backend: 'dOqLegz0W8159Q0X2, fNbEf-pmK, r1zrECSYr_FgUDMbIu2',
        falcon_version: 'lsSRGjjnhpl2Cz-, -KPJKI_kSyHVP5khj',
      },
    },
    expectedText: 'CrowdStrike',
  },
  {
    name: 'Microsoft SQL',
    workloads: {
      mssql: {
        version: 'nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL',
      },
    },
    expectedText: 'Microsoft SQL',
  },
  {
    name: 'Oracle DB',
    workloads: {
      oracle_db: {
        is_running: true,
      },
    },
    expectedText: 'Oracle Database',
  },
  {
    name: 'Oracle DB',
    workloads: {
      oracle_db: {
        is_running: false,
      },
    },
    expectedText: 'Oracle Database',
  },
];
