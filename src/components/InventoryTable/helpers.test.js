import { sortable } from '@patternfly/react-table';
import { render } from '@testing-library/react';
import React from 'react';
import {
  MOVE_SYSTEM_MENU_TEXT,
  NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
} from '../../constants';
import {
  buildCells,
  buildMoveSystemActionsColumnItem,
  createColumns,
  createRows,
  getGroupSystemsBulkActionDisabled,
  hasWorkspaceEdit,
  isKesselBulkMoveSystemsDisabled,
  isKesselMoveSystemRowDisabled,
  onDeleteFilter,
  onDeleteTag,
} from './helpers';

describe('buildCells', () => {
  it('should create cells without renderFunc', () => {
    const data = buildCells(
      {
        first: 'test',
        second: {
          dot: 'dot',
        },
      },
      [{ key: 'first' }, { key: 'second.dot' }, { key: 'third' }],
    );
    expect(data.length).toBe(3);
    expect(data[0]).toBe('test');
    expect(data[1]).toBe('dot');
    expect(data[2]).toBe(' ');
  });

  it('should create cells with renderFunc', () => {
    const renderFunc = () => 'testing';
    const data = buildCells(
      {
        first: 'test',
        second: {
          dot: 'dot',
        },
      },
      [{ key: 'first' }, { key: 'second.dot' }, { key: 'third', renderFunc }],
    );
    expect(data.length).toBe(3);
    expect(data[0]).toBe('test');
    expect(data[1]).toBe('dot');

    const view = render(data[2]);
    expect(view.asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        testing
      </DocumentFragment>
    `);
  });
});

describe('createRows', () => {
  const rows = [...new Array(5)].map(() => ({
    first: 'test',
    second: {
      dot: 'dot',
    },
  }));

  const cells = [{ key: 'first' }, { key: 'second.dot' }, { key: 'third' }];
  it('should create empty table', () => {
    const data = createRows();
    expect(data[0].cells[0].props.colSpan).toBe(0);
  });

  it('should create empty table with actions', () => {
    const data = createRows([], cells, { actions: [] });
    expect(data[0].cells[0].props.colSpan).toBe(4);
  });

  it('should create regular table', () => {
    const data = createRows(rows, cells);
    expect(data.length).toBe(rows.length);
    expect(data[0].cells[0]).toBe('test');
    expect(data[0].cells[1]).toBe('dot');
    expect(data[0].cells[2]).toBe(' ');
  });

  describe('expandable', () => {
    it('should create collapsed table', () => {
      const data = createRows(
        rows.map((item) => ({ ...item, children: <div>Something</div> })),
        cells,
        { expandable: true },
      );
      expect(data[1].parent).toBe(0);
      expect(data[3].parent).toBe(2);
      expect(data.length).toBe(rows.length * 2);
    });

    it('should create expanded table with function children', () => {
      const data = createRows(
        rows.map((item) => ({
          ...item,
          children: () => 'something',
          isOpen: true,
        })),
        cells,
        { expandable: true },
      );
      expect(data[0].isOpen).toBe(true);
      expect(data.length).toBe(rows.length * 2);
    });
  });
});

describe('onDeleteFilter', () => {
  const filter = ['something'];
  it('should delete filter', () => {
    const data = onDeleteFilter(
      {
        chips: [
          {
            value: 'something',
          },
        ],
      },
      filter,
    );
    expect(data.length).toBe(0);
  });

  it('should not delete filter', () => {
    const data = onDeleteFilter(
      {
        chips: [
          {
            value: 'wrong',
          },
        ],
      },
      filter,
    );
    expect(data.length).toBe(1);
    expect(data).toMatchObject(filter);
  });

  it('should not delete filter if no delete filter', () => {
    const data = onDeleteFilter(undefined, filter);
    expect(data.length).toBe(1);
    expect(data).toMatchObject(filter);
  });

  it('should delete workspace filter selected by id', () => {
    const workspaceFilter = [
      { id: 'ws-1', name: 'Workspace One' },
      { id: 'ws-2', name: 'Workspace Two' },
    ];
    const data = onDeleteFilter(
      { chips: [{ value: 'ws-1' }] },
      workspaceFilter,
    );
    expect(data).toEqual([{ id: 'ws-2', name: 'Workspace Two' }]);
  });
});

describe('onDeleteTag', () => {
  const selectedTags = {
    AAzfYuEy: {
      'Eetzha=dbFigb': {
        isSelected: true,
        group: {
          label: 'AAzfYuEy',
          value: 'AAzfYuEy',
          type: 'checkbox',
        },
        item: {
          meta: {
            tag: {
              key: 'Eetzha',
              value: 'dbFigb',
            },
          },
        },
      },
    },
  };

  it('should call onDeleteTag with updated value', () => {
    const onApplyTags = jest.fn();
    const data = onDeleteTag(
      {
        type: 'tags',
        key: 'AAzfYuEy',
        category: 'AAzfYuEy',
        chips: [
          {
            key: 'Eetzha=dbFigb',
            tagKey: 'Eetzha',
            value: 'dbFigb',
            name: 'Eetzha=dbFigb',
            group: {
              value: 'AAzfYuEy',
              label: 'AAzfYuEy',
              type: 'checkbox',
            },
          },
        ],
      },
      selectedTags,
      onApplyTags,
    );

    expect(onApplyTags).toHaveBeenCalled();
    expect(data['AAzfYuEy']?.['Eetzha=dbFigb']).toBe(undefined);
  });

  it('should call onDeleteTag without updated value', () => {
    const data = onDeleteTag({}, selectedTags);
    expect(data).toMatchObject(selectedTags);
  });
});

describe('createColumns', () => {
  it('should create regular columns with custom transforms and cellFormatters', () => {
    const data = createColumns(
      [
        {
          transforms: [() => undefined],
          cellFormatters: [() => undefined],
        },
        { data: 'something' },
      ],
      false,
      ['something'],
    );
    expect(data[0].transforms.length).toBe(2);
    expect(data[0].cellFormatters.length).toBe(1);
    expect(data[1].transforms.length).toBe(1);
    expect(data[1]).toMatchObject({ data: 'something' });
  });

  it('should create expandable columns', () => {
    const data = createColumns(
      [{ data: 'something' }],
      false,
      ['something'],
      true,
    );
    expect(data[0].cellFormatters.length).toBe(1);
  });

  it('should create columns with width', () => {
    const data = createColumns(
      [{ data: 'something', props: { width: 10 } }],
      false,
      ['something'],
    );
    expect(data[0].transforms.length).toBe(2);
  });

  describe('sortable', () => {
    it('adds sortable by default', () => {
      const data = createColumns([{ data: 'something' }], false, ['something']);

      expect(data[0].transforms).toEqual([sortable]);
    });

    it('filter duplicate sortables', () => {
      const data = createColumns(
        [{ data: 'something', transforms: [sortable] }],
        false,
        ['something'],
      );

      expect(data[0].transforms).toEqual([sortable]);
    });

    it('filter duplicate sortables when different function', () => {
      const thisAddsSorting = () => ({ element: { onSort: jest.fn() } });

      const data = createColumns(
        [{ data: 'something', transforms: [thisAddsSorting] }],
        false,
        ['something'],
      );

      expect(data[0].transforms).toEqual([thisAddsSorting]);
    });
  });

  describe('non sortable', () => {
    it('should respect isStatic prop', () => {
      const data = createColumns(
        [{ data: 'something', props: { isStatic: true } }],
        false,
        ['something'],
      );
      expect(data[0].transforms.length).toBe(0);
    });

    it('should respect items with 0 length', () => {
      const data = createColumns([{ data: 'something' }], true, ['something']);
      expect(data[0].transforms.length).toBe(0);
    });
  });
});

describe('move system row action helpers', () => {
  describe('hasWorkspaceEdit', () => {
    it('returns true when permission is set', () => {
      expect(
        hasWorkspaceEdit({ permissions: { hasWorkspaceEdit: true } }),
      ).toBe(true);
    });

    it('returns false when permission is missing or false', () => {
      expect(hasWorkspaceEdit({})).toBe(false);
      expect(
        hasWorkspaceEdit({ permissions: { hasWorkspaceEdit: false } }),
      ).toBe(false);
    });
  });

  describe('isKesselMoveSystemRowDisabled', () => {
    it('is disabled when workspace actions are not allowed', () => {
      expect(
        isKesselMoveSystemRowDisabled(
          { permissions: { hasWorkspaceEdit: true } },
          false,
        ),
      ).toBe(true);
    });

    it('is disabled when host lacks workspace edit', () => {
      expect(
        isKesselMoveSystemRowDisabled(
          { permissions: { hasWorkspaceEdit: false } },
          true,
        ),
      ).toBe(true);
    });

    it('is enabled when allowed and host has workspace edit', () => {
      expect(
        isKesselMoveSystemRowDisabled(
          { permissions: { hasWorkspaceEdit: true } },
          true,
        ),
      ).toBe(false);
    });
  });

  describe('isKesselBulkMoveSystemsDisabled', () => {
    it('is disabled when no hosts are selected', () => {
      expect(isKesselBulkMoveSystemsDisabled(true, [])).toBe(true);
    });

    it('is disabled when workspace actions are not allowed', () => {
      expect(
        isKesselBulkMoveSystemsDisabled(false, [
          { permissions: { hasWorkspaceEdit: true } },
        ]),
      ).toBe(true);
    });

    it('is disabled when any selected host lacks workspace edit', () => {
      expect(
        isKesselBulkMoveSystemsDisabled(true, [
          { permissions: { hasWorkspaceEdit: true } },
          { permissions: { hasWorkspaceEdit: false } },
        ]),
      ).toBe(true);
    });

    it('is enabled when all selected hosts have workspace edit', () => {
      expect(
        isKesselBulkMoveSystemsDisabled(true, [
          { permissions: { hasWorkspaceEdit: true } },
          { permissions: { hasWorkspaceEdit: true } },
        ]),
      ).toBe(false);
    });
  });

  describe('getGroupSystemsBulkActionDisabled', () => {
    it('uses Kessel bulk rules when Kessel is enabled', () => {
      expect(
        getGroupSystemsBulkActionDisabled({
          isKesselEnabled: true,
          workspaceActionsAllowed: true,
          ungrouped: false,
          selectedCount: 1,
          selectedHosts: [{ permissions: { hasWorkspaceEdit: false } }],
        }),
      ).toBe(true);
    });

    it('uses legacy bulk rules when Kessel is disabled', () => {
      expect(
        getGroupSystemsBulkActionDisabled({
          isKesselEnabled: false,
          workspaceActionsAllowed: true,
          ungrouped: true,
          selectedCount: 1,
          selectedHosts: [{ permissions: { hasWorkspaceEdit: true } }],
        }),
      ).toBe(true);
    });

    it('enables Kessel bulk move when selection and permissions are valid', () => {
      expect(
        getGroupSystemsBulkActionDisabled({
          isKesselEnabled: true,
          workspaceActionsAllowed: true,
          ungrouped: false,
          selectedCount: 2,
          selectedHosts: [
            { permissions: { hasWorkspaceEdit: true } },
            { permissions: { hasWorkspaceEdit: true } },
          ],
        }),
      ).toBe(false);
    });

    it('enables legacy bulk remove when workspace is grouped and selected', () => {
      expect(
        getGroupSystemsBulkActionDisabled({
          isKesselEnabled: false,
          workspaceActionsAllowed: true,
          ungrouped: false,
          selectedCount: 1,
          selectedHosts: [],
        }),
      ).toBe(false);
    });
  });

  describe('buildMoveSystemActionsColumnItem', () => {
    it('includes tooltip when disabled', () => {
      const item = buildMoveSystemActionsColumnItem(
        { permissions: { hasWorkspaceEdit: false } },
        jest.fn(),
        true,
      );

      expect(item.title).toBe(MOVE_SYSTEM_MENU_TEXT);
      expect(item.isDisabled).toBe(true);
      expect(item.tooltipProps).toEqual({
        content: NO_MOVE_SYSTEM_KESSEL_TOOLTIP_MESSAGE,
      });
    });

    it('omits tooltip when enabled', () => {
      const item = buildMoveSystemActionsColumnItem(
        { permissions: { hasWorkspaceEdit: true } },
        jest.fn(),
        true,
      );

      expect(item.isDisabled).toBe(false);
      expect(item.tooltipProps).toBeUndefined();
    });
  });
});
