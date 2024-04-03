import { render } from '@testing-library/react';
import {
  diskMapper,
  enabledHelper,
  generalMapper,
  interfaceMapper,
  productsMapper,
  repositoriesMapper,
  statusHelper,
} from './dataMapper';

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
