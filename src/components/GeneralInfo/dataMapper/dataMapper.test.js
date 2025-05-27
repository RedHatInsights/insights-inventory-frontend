import { render } from '@testing-library/react';
import {
  diskMapper,
  enabledHelper,
  generalMapper,
  interfaceMapper,
  productsMapper,
  repositoriesMapper,
  statusHelper,
  workloadsDataMapper,
} from './dataMapper';

export const mockWorkloadsData = {
  ansible: {
    catalog_worker_version: '9.8.7, banana.42, 0.0.abc',
    controller_version: 'x.1.2, foo.bar, 3.3.3',
    hub_version: 'abc.def, 123.456, xyz.789',
    sso_version: 'preview-1, glitch.9.9, zz-top.7',
  },
  rhel_ai: {
    amd_gpu_models: ['Quantum Spark GT, Mangoburst 900X'],
    intel_gaudi_hpu_models: ['Turbo Flux HL-Ω1, Gaudi++ Phantom Edition'],
    nvidia_gpu_models: ['RTX Hypernova 12X, GX-99π Phantom'],
    rhel_ai_version_id: 'vX.Y.Z-beta',
    variant: 'RHEL AI Galactic',
  },
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
  crowdstrike: {
    falcon_aid: 'xfoCshFVO6TwXdGHvy',
    falcon_backend: 'dOqLegz0W8159Q0X2, fNbEf-pmK, r1zrECSYr_FgUDMbIu2',
    falcon_version: 'lsSRGjjnhpl2Cz-, -KPJKI_kSyHVP5khj',
  },
  ibm_db2: {
    is_running: false,
  },
  mssql: {
    version: 'nTQNi8yZSTEN, x_OkwFDlxq7dl, LkIh__hO0qTnYZoCwL',
  },
  oracle_db: {
    is_running: false,
  },
  sap: {
    instance_number: 'j2r1MRNe49og, df.lWNAV._m_2sbl, KAS1MYAqXXqGIirplJG',
    sap_system: true,
    sids: ['FudUaJbpiPfLVJkNUT.F, 2DSO9DmPKg30, Vx-jCe1ibHTHj01A'],
    version: 'ezU7Htkuo, GU_aiKHi52n7PFH, ONRu1Ku4_skoUXrR',
  },
};

Object.keys(statusHelper).map((oneStatus) => {
  it(`should return ${oneStatus}`, () => {
    const view = render(statusHelper[oneStatus]);
    expect(view.asFragment()).toMatchSnapshot();
  });
});

Object.keys(enabledHelper).map((oneStatus) => {
  it(`should return ${oneStatus}`, () => {
    const view = render(enabledHelper[oneStatus]);
    expect(view.asFragment()).toMatchSnapshot();
  });
});

// TODO: improve tests by possibly adding more edge cases and generating input data dynamically

describe('diskMapper', () => {
  it('diskMapper', () => {
    expect(
      diskMapper([
        {
          device: 'device',
          label: 'label',
          mountpoint: 'mount',
          options: {
            test: 'data',
          },
          mounttype: 'type',
        },
      ])
    ).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "Device",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Label",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Mount point",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Type",
            "transforms": [
              [Function],
            ],
          },
        ],
        "expandable": true,
        "rows": [
          {
            "cells": [
              "device",
              "label",
              "mount",
              "type",
            ],
            "child": <div>
              test=data
            </div>,
            "isOpen": false,
          },
        ],
      }
    `);
  });

  it('diskMapper with values', () => {
    expect(
      diskMapper([
        {
          device: { value: 'device' },
          label: { value: 'label' },
          mountpoint: { value: 'mount' },
          options: {
            options: {
              value: { test: 'data' },
            },
          },
          mounttype: 'type',
        },
      ])
    ).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "Device",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Label",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Mount point",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Type",
            "transforms": [
              [Function],
            ],
          },
        ],
        "expandable": true,
        "rows": [
          {
            "cells": [
              "device",
              {
                "value": "label",
              },
              "mount",
              "type",
            ],
            "child": <div>
              test=data
            </div>,
            "isOpen": false,
          },
        ],
      }
    `);
  });

  it('diskMapper - no data', () => {
    expect(diskMapper()).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "Device",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Label",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Mount point",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Type",
            "transforms": [
              [Function],
            ],
          },
        ],
        "expandable": true,
        "rows": [],
      }
    `);
  });
});

describe('generalMapper', () => {
  it('generalMapper', () => {
    expect(generalMapper(['one', 'two'], 'test')).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "test",
            "transforms": [
              [Function],
            ],
          },
        ],
        "filters": [
          {
            "type": "text",
          },
        ],
        "rows": [
          [
            "one",
          ],
          [
            "two",
          ],
        ],
      }
    `);
  });

  it('generalMapper - no data', () => {
    expect(generalMapper()).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "",
            "transforms": [
              [Function],
            ],
          },
        ],
        "filters": [
          {
            "type": "text",
          },
        ],
        "rows": [],
      }
    `);
  });
});

describe('interfaceMapper', () => {
  it('interfaceMapper', () => {
    expect(
      interfaceMapper([
        {
          mac_address: 'test-mac',
          mtu: 'test-mtu',
          name: 'test-name',
          state: 'UP',
          type: 'test-type',
        },
        {
          mac_address: 'test-mac2',
          mtu: 'test-mtu2',
          name: 'test-name2',
          state: 'DOWN',
          type: 'test-type2',
        },
        {
          mac_address: 'test-mac2',
          mtu: 'test-mtu2',
          name: 'test-name2',
          state: 'WRONG',
          type: 'test-type2',
        },
      ])
    ).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "MAC address",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "MTU",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Name",
            "transforms": [
              [Function],
            ],
          },
          "State",
          {
            "title": "Type",
            "transforms": [
              [Function],
            ],
          },
        ],
        "rows": [
          [
            "test-mac",
            "test-mtu",
            "test-name",
            {
              "title": <Tooltip
                content="Service is running"
              >
                <OutlinedArrowAltCircleUpIcon
                  className="ins-c-inventory__detail--up"
                />
              </Tooltip>,
            },
            "test-type",
          ],
          [
            "test-mac2",
            "test-mtu2",
            "test-name2",
            {
              "title": <Tooltip
                content="Service has stopped"
              >
                <OutlinedArrowAltCircleDownIcon
                  className="ins-c-inventory__detail--down"
                />
              </Tooltip>,
            },
            "test-type2",
          ],
          [
            "test-mac2",
            "test-mtu2",
            "test-name2",
            {
              "title": <Tooltip
                content="Unknown service status"
              >
                <OutlinedQuestionCircleIcon
                  className="ins-c-inventory__detail--unknown"
                />
              </Tooltip>,
            },
            "test-type2",
          ],
        ],
      }
    `);
  });

  it('interfaceMapper - no data', () => {
    expect(interfaceMapper()).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "MAC address",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "MTU",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Name",
            "transforms": [
              [Function],
            ],
          },
          "State",
          {
            "title": "Type",
            "transforms": [
              [Function],
            ],
          },
        ],
        "rows": [],
      }
    `);
  });
});

describe('productsMapper', () => {
  it('productsMapper', () => {
    expect(
      productsMapper([
        {
          name: 'test-name',
          status: true,
        },
        {
          name: 'test-name',
          status: false,
        },
        {
          name: 'test-name',
        },
      ])
    ).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "Name",
            "transforms": [
              [Function],
            ],
          },
          "Status",
        ],
        "rows": [
          [
            "test-name",
            {
              "title": <Tooltip
                content="Unknown service status"
              >
                <OutlinedQuestionCircleIcon
                  className="ins-c-inventory__detail--unknown"
                />
              </Tooltip>,
            },
          ],
          [
            "test-name",
            {
              "title": <Tooltip
                content="Unknown service status"
              >
                <OutlinedQuestionCircleIcon
                  className="ins-c-inventory__detail--unknown"
                />
              </Tooltip>,
            },
          ],
          [
            "test-name",
            {
              "title": <Tooltip
                content="Unknown service status"
              >
                <OutlinedQuestionCircleIcon
                  className="ins-c-inventory__detail--unknown"
                />
              </Tooltip>,
            },
          ],
        ],
      }
    `);
  });

  it('productsMapper - no data', () => {
    expect(productsMapper()).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "Name",
            "transforms": [
              [Function],
            ],
          },
          "Status",
        ],
        "rows": [],
      }
    `);
  });
});

describe('repositoriesMapper', () => {
  it('repositoriesMapper', () => {
    expect(
      repositoriesMapper({
        enabled: [
          {
            base_url: 'test-url',
            name: 'test-name',
            enabled: true,
            gpgcheck: false,
          },
          {
            base_url: 'test-url',
            name: 'test-name',
            enabled: true,
            gpgcheck: true,
          },
        ],

        disabled: [
          {
            base_url: 'test-url',
            name: 'test-name',
            enabled: false,
            gpgcheck: false,
          },
          {
            base_url: 'test-url',
            name: 'test-name',
            gpgcheck: false,
          },
        ],
      })
    ).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "Name",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Enabled",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "GPG check",
            "transforms": [
              [Function],
            ],
          },
        ],
        "filters": [
          {
            "type": "text",
          },
          {
            "options": [
              {
                "label": "Is enabled",
                "value": "true",
              },
              {
                "label": "Not enabled",
                "value": "false",
              },
            ],
            "type": "checkbox",
          },
          {
            "options": [
              {
                "label": "Is enabled",
                "value": "true",
              },
              {
                "label": "Not enabled",
                "value": "false",
              },
            ],
            "type": "checkbox",
          },
        ],
        "rows": [
          [
            {
              "sortValue": "test-name",
              "title": "test-name",
            },
            {
              "sortValue": "true",
              "title": <Tooltip
                content="Source enabled"
              >
                <CheckCircleIcon
                  className="ins-c-inventory__detail--enabled"
                />
              </Tooltip>,
            },
            {
              "sortValue": "false",
              "title": <Tooltip
                content="Source disabled"
              >
                <TimesIcon
                  className="ins-c-inventory__detail--disabled"
                />
              </Tooltip>,
            },
          ],
          [
            {
              "sortValue": "test-name",
              "title": "test-name",
            },
            {
              "sortValue": "true",
              "title": <Tooltip
                content="Source enabled"
              >
                <CheckCircleIcon
                  className="ins-c-inventory__detail--enabled"
                />
              </Tooltip>,
            },
            {
              "sortValue": "true",
              "title": <Tooltip
                content="Source enabled"
              >
                <CheckCircleIcon
                  className="ins-c-inventory__detail--enabled"
                />
              </Tooltip>,
            },
          ],
          [
            {
              "sortValue": "test-name",
              "title": "test-name",
            },
            {
              "sortValue": "false",
              "title": <Tooltip
                content="Source disabled"
              >
                <TimesIcon
                  className="ins-c-inventory__detail--disabled"
                />
              </Tooltip>,
            },
            {
              "sortValue": "false",
              "title": <Tooltip
                content="Source disabled"
              >
                <TimesIcon
                  className="ins-c-inventory__detail--disabled"
                />
              </Tooltip>,
            },
          ],
          [
            {
              "sortValue": "test-name",
              "title": "test-name",
            },
            {
              "sortValue": "undefined",
              "title": <Tooltip
                content="Source disabled"
              >
                <TimesIcon
                  className="ins-c-inventory__detail--disabled"
                />
              </Tooltip>,
            },
            {
              "sortValue": "false",
              "title": <Tooltip
                content="Source disabled"
              >
                <TimesIcon
                  className="ins-c-inventory__detail--disabled"
                />
              </Tooltip>,
            },
          ],
        ],
      }
    `);
  });

  it('repositoriesMapper - no data', () => {
    expect(repositoriesMapper()).toMatchInlineSnapshot(`
      {
        "cells": [
          {
            "title": "Name",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "Enabled",
            "transforms": [
              [Function],
            ],
          },
          {
            "title": "GPG check",
            "transforms": [
              [Function],
            ],
          },
        ],
        "filters": [
          {
            "type": "text",
          },
          {
            "options": [
              {
                "label": "Is enabled",
                "value": "true",
              },
              {
                "label": "Not enabled",
                "value": "false",
              },
            ],
            "type": "checkbox",
          },
          {
            "options": [
              {
                "label": "Is enabled",
                "value": "true",
              },
              {
                "label": "Not enabled",
                "value": "false",
              },
            ],
            "type": "checkbox",
          },
        ],
        "rows": [],
      }
    `);
  });
});

describe('workloadsDataMapper test', () => {
  it('maps Ansible data correctly with selected fieldKeys', () => {
    const result = workloadsDataMapper({
      data: [mockWorkloadsData.ansible],
      fieldKeys: ['controller_version', 'hub_version'],
      columnTitles: ['Controller version', 'Hub version'],
    });

    expect(result.cells).toEqual([
      { title: 'Controller version' },
      { title: 'Hub version' },
    ]);
    expect(result.rows).toEqual([
      ['x.1.2, foo.bar, 3.3.3', 'abc.def, 123.456, xyz.789'],
    ]);
  });

  it('flattens array values for RHEL AI correctly', () => {
    const result = workloadsDataMapper({
      data: [mockWorkloadsData.rhel_ai],
      fieldKeys: ['amd_gpu_models', 'nvidia_gpu_models'],
      columnTitles: ['AMD GPU models', 'Nvidia GPU models'],
    });

    expect(result.rows).toEqual([
      [
        'Quantum Spark GT, Mangoburst 900X',
        'RTX Hypernova 12X, GX-99π Phantom',
      ],
    ]);
  });

  it('handles Intersystems running_instances array correctly', () => {
    const result = workloadsDataMapper({
      data: mockWorkloadsData.intersystems.running_instances,
      fieldKeys: ['instance_name', 'product', 'version'],
      columnTitles: ['Instance name', 'Product', 'Version'],
    });

    expect(result.cells).toEqual([
      { title: 'Instance name' },
      { title: 'Product' },
      { title: 'Version' },
    ]);

    expect(result.rows).toEqual([
      ['NOVA-X, ENV-Δ42', 'HyperIRIS', '3021.∞, nebula.7'],
    ]);
  });

  it('returns single-column structure when no fieldKeys are provided', () => {
    const result = workloadsDataMapper({
      data: [{ version: '1.0.0' }],
      fieldKeys: [],
    });

    expect(result.cells).toEqual([{ title: 'Value' }]);
    expect(result.rows).toEqual([['1.0.0']]);
  });

  it('handles missing fields gracefully', () => {
    const result = workloadsDataMapper({
      data: [{ foo: 'bar' }],
      fieldKeys: ['foo', 'missing_field'],
    });

    expect(result.rows).toEqual([['bar', '']]);
  });

  it('handles mixed types (boolean, string, array)', () => {
    const result = workloadsDataMapper({
      data: [
        {
          bool_field: true,
          string_field: 'hello',
          array_field: ['a', 'b', 'c'],
        },
      ],
      fieldKeys: ['bool_field', 'string_field', 'array_field'],
    });

    expect(result.rows).toEqual([[true, 'hello', 'a, b, c']]);
  });
});