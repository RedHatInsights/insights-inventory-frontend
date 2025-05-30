import { sortable } from '@patternfly/react-table';
import { render } from '@testing-library/react';
import React from 'react';
import {
  buildCells,
  createColumns,
  createRows,
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
