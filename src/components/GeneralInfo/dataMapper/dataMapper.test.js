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
    Object {
      "cells": Array [
        Object {
          "title": "Device",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Label",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Mount point",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Type",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "expandable": true,
      "rows": Array [
        Object {
          "cells": Array [
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
    Object {
      "cells": Array [
        Object {
          "title": "Device",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Label",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Mount point",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Type",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "expandable": true,
      "rows": Array [
        Object {
          "cells": Array [
            "device",
            Object {
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
    Object {
      "cells": Array [
        Object {
          "title": "Device",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Label",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Mount point",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Type",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "expandable": true,
      "rows": Array [],
    }
  `);
  });
});

describe('generalMapper', () => {
  it('generalMapper', () => {
    expect(generalMapper(['one', 'two'], 'test')).toMatchInlineSnapshot(`
    Object {
      "cells": Array [
        Object {
          "title": "test",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "filters": Array [
        Object {
          "type": "textual",
        },
      ],
      "rows": Array [
        Array [
          "one",
        ],
        Array [
          "two",
        ],
      ],
    }
  `);
  });

  it('generalMapper - no data', () => {
    expect(generalMapper()).toMatchInlineSnapshot(`
    Object {
      "cells": Array [
        Object {
          "title": "",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "filters": Array [
        Object {
          "type": "textual",
        },
      ],
      "rows": Array [],
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
    Object {
      "cells": Array [
        Object {
          "title": "MAC address",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "MTU",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Name",
          "transforms": Array [
            [Function],
          ],
        },
        "State",
        Object {
          "title": "Type",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "rows": Array [
        Array [
          "test-mac",
          "test-mtu",
          "test-name",
          Object {
            "title": <Tooltip
              content="Service is running"
            >
              <OutlinedArrowAltCircleUpIcon
                className="ins-c-inventory__detail--up"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
          "test-type",
        ],
        Array [
          "test-mac2",
          "test-mtu2",
          "test-name2",
          Object {
            "title": <Tooltip
              content="Service has stopped"
            >
              <OutlinedArrowAltCircleDownIcon
                className="ins-c-inventory__detail--down"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
          "test-type2",
        ],
        Array [
          "test-mac2",
          "test-mtu2",
          "test-name2",
          Object {
            "title": <Tooltip
              content="Unknown service status"
            >
              <OutlinedQuestionCircleIcon
                className="ins-c-inventory__detail--unknown"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
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
    Object {
      "cells": Array [
        Object {
          "title": "MAC address",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "MTU",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Name",
          "transforms": Array [
            [Function],
          ],
        },
        "State",
        Object {
          "title": "Type",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "rows": Array [],
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
    Object {
      "cells": Array [
        Object {
          "title": "Name",
          "transforms": Array [
            [Function],
          ],
        },
        "Status",
      ],
      "rows": Array [
        Array [
          "test-name",
          Object {
            "title": <Tooltip
              content="Unknown service status"
            >
              <OutlinedQuestionCircleIcon
                className="ins-c-inventory__detail--unknown"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
        ],
        Array [
          "test-name",
          Object {
            "title": <Tooltip
              content="Unknown service status"
            >
              <OutlinedQuestionCircleIcon
                className="ins-c-inventory__detail--unknown"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
        ],
        Array [
          "test-name",
          Object {
            "title": <Tooltip
              content="Unknown service status"
            >
              <OutlinedQuestionCircleIcon
                className="ins-c-inventory__detail--unknown"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
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
    Object {
      "cells": Array [
        Object {
          "title": "Name",
          "transforms": Array [
            [Function],
          ],
        },
        "Status",
      ],
      "rows": Array [],
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
    Object {
      "cells": Array [
        Object {
          "title": "Name",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Enabled",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "GPG check",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "filters": Array [
        Object {
          "type": "textual",
        },
        Object {
          "options": Array [
            Object {
              "label": "Is enabled",
              "value": "true",
            },
            Object {
              "label": "Not enabled",
              "value": "false",
            },
          ],
          "type": "checkbox",
        },
        Object {
          "options": Array [
            Object {
              "label": "Is enabled",
              "value": "true",
            },
            Object {
              "label": "Not enabled",
              "value": "false",
            },
          ],
          "type": "checkbox",
        },
      ],
      "rows": Array [
        Array [
          Object {
            "sortValue": "test-name",
            "title": "test-name",
          },
          Object {
            "sortValue": "true",
            "title": <Tooltip
              content="Source enabled"
            >
              <CheckCircleIcon
                className="ins-c-inventory__detail--enabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
          Object {
            "sortValue": "false",
            "title": <Tooltip
              content="Source disabled"
            >
              <TimesIcon
                className="ins-c-inventory__detail--disabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
        ],
        Array [
          Object {
            "sortValue": "test-name",
            "title": "test-name",
          },
          Object {
            "sortValue": "true",
            "title": <Tooltip
              content="Source enabled"
            >
              <CheckCircleIcon
                className="ins-c-inventory__detail--enabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
          Object {
            "sortValue": "true",
            "title": <Tooltip
              content="Source enabled"
            >
              <CheckCircleIcon
                className="ins-c-inventory__detail--enabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
        ],
        Array [
          Object {
            "sortValue": "test-name",
            "title": "test-name",
          },
          Object {
            "sortValue": "false",
            "title": <Tooltip
              content="Source disabled"
            >
              <TimesIcon
                className="ins-c-inventory__detail--disabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
          Object {
            "sortValue": "false",
            "title": <Tooltip
              content="Source disabled"
            >
              <TimesIcon
                className="ins-c-inventory__detail--disabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
        ],
        Array [
          Object {
            "sortValue": "test-name",
            "title": "test-name",
          },
          Object {
            "sortValue": "undefined",
            "title": <Tooltip
              content="Source disabled"
            >
              <TimesIcon
                className="ins-c-inventory__detail--disabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
              />
            </Tooltip>,
          },
          Object {
            "sortValue": "false",
            "title": <Tooltip
              content="Source disabled"
            >
              <TimesIcon
                className="ins-c-inventory__detail--disabled"
                color="currentColor"
                noVerticalAlign={false}
                size="sm"
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
    Object {
      "cells": Array [
        Object {
          "title": "Name",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "Enabled",
          "transforms": Array [
            [Function],
          ],
        },
        Object {
          "title": "GPG check",
          "transforms": Array [
            [Function],
          ],
        },
      ],
      "filters": Array [
        Object {
          "type": "textual",
        },
        Object {
          "options": Array [
            Object {
              "label": "Is enabled",
              "value": "true",
            },
            Object {
              "label": "Not enabled",
              "value": "false",
            },
          ],
          "type": "checkbox",
        },
        Object {
          "options": Array [
            Object {
              "label": "Is enabled",
              "value": "true",
            },
            Object {
              "label": "Not enabled",
              "value": "false",
            },
          ],
          "type": "checkbox",
        },
      ],
      "rows": Array [],
    }
  `);
  });
});
