import { sortable } from '@patternfly/react-table';
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import InfoTable from './InfoTable';

const paginationShouldExist = () => {
  expect(
    screen.getAllByRole('button', { name: /items per page/i })
  ).toHaveLength(2);
  expect(
    screen.getAllByRole('button', { name: /go to previous page/i })
  ).toHaveLength(2);
  expect(
    screen.getAllByRole('button', { name: /go to next page/i })
  ).toHaveLength(2);
  screen.getByRole('button', {
    name: /go to first page/i,
  });
  screen.getByRole('button', {
    name: /go to last page/i,
  });
  screen.getByRole('spinbutton', {
    name: /current page/i,
  });
};

describe('InfoTable', () => {
  describe('should render', () => {
    it('no data', () => {
      render(<InfoTable />);

      paginationShouldExist();
      screen.getByRole('grid', {
        name: /general information dialog table/i,
      });
      expect(screen.getByRole('row')).toBeVisible(); // only header
    });

    it('one cell', () => {
      render(
        <InfoTable
          cells={['One cell']}
          rows={[
            'first',
            { title: 'second from title' },
            ['multiple', 'cells'],
          ]}
        />
      );

      paginationShouldExist();
      expect(
        screen.queryByRole('grid', {
          name: /general information dialog table/i,
        })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
      screen.getByText('first');
      screen.getByText('second from title');
      screen.getByText(/multiplecells/i);
    });

    it('multiple cells', () => {
      render(
        <InfoTable
          cells={['One cell', 'Second one']}
          rows={[
            ['first', 'second'],
            [{ title: 'second from title' }, 'another'],
            ['multiple', 'cells'],
          ]}
        />
      );

      paginationShouldExist();
      expect(
        screen.getByRole('grid', {
          name: /general information dialog table/i,
        })
      ).toHaveTextContent(
        'One cellSecond onefirstsecondsecond from titleanothermultiplecells'
      );
      expect(screen.getAllByRole('row')).toHaveLength(4); // including header
      screen.getByRole('columnheader', {
        name: /one cell/i,
      });
      screen.getByRole('columnheader', {
        name: /second one/i,
      });
    });

    it('expandable set to true', () => {
      render(
        <InfoTable
          expandable
          cells={['One cell', 'Second one']}
          rows={[
            {
              cells: ['first', 'second'],
            },
            {
              cells: [{ title: 'second from title' }],
            },
            {
              cells: ['multiple', 'cells'],
            },
          ]}
        />
      );

      within(
        screen.getByRole('row', {
          name: /details first second/i,
        })
      ).getByRole('button', {
        name: /details/i,
      });
      within(
        screen.getByRole('row', {
          name: /details second from title/i,
        })
      ).getByRole('button', {
        name: /details/i,
      });
      within(
        screen.getByRole('row', {
          name: /details multiple cells/i,
        })
      ).getByRole('button', {
        name: /details/i,
      });
    });

    it('onSort set', async () => {
      const onSort = jest.fn();
      render(
        <InfoTable
          onSort={onSort}
          cells={[{ title: 'One cell', transforms: [sortable] }, 'Second one']}
          rows={[
            ['first', 'second'],
            [{ title: 'second from title' }, 'another'],
            ['multiple', 'cells'],
          ]}
        />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /one cell/i,
        })
      );
      expect(onSort).toBeCalled();
    });
  });

  describe('api', () => {
    it('onSort with expandable', async () => {
      const onSort = jest.fn();
      render(
        <InfoTable
          expandable
          onSort={onSort}
          cells={[{ title: 'One cell', transforms: [sortable] }, 'Second one']}
          rows={[
            {
              cells: ['first', 'second'],
            },
            {
              cells: [{ title: 'second from title' }],
            },
            {
              cells: ['multiple', 'cells'],
            },
            {
              cells: ['child'],
            },
          ]}
        />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /one cell/i,
        })
      );
      expect(onSort.mock.calls[0][1]).toBe(0);
      expect(onSort.mock.calls[0][2]).toBe('desc');
    });

    it('should limit number of rows', () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map(() => [...new Array(2)])}
        />
      );

      expect(screen.getAllByRole('row')).toHaveLength(11); // including header
    });

    it('should paginate to next page', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map((_e, index) =>
            [...new Array(2)].map((_e, cell) => `${index}-${cell}`)
          )}
        />
      );

      await userEvent.click(
        screen.getAllByRole('button', { name: /go to next page/i })[0]
      );

      expect(
        screen.getAllByRole('row').map((element) => element.textContent)
      ).toEqual([
        'One cellSecond one',
        '10-010-1',
        '11-011-1',
        '12-012-1',
        '13-013-1',
        '14-014-1',
        '15-015-1',
        '16-016-1',
        '17-017-1',
        '18-018-1',
        '19-019-1',
      ]);
    });

    it('should paginate to 1 when filtering', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map((_e, index) =>
            [...new Array(2)].map((_e, cell) => `${index}-${cell}`)
          )}
          filters={[{ index: 0 }, { index: 1 }]}
        />
      );

      await userEvent.click(
        screen.getAllByRole('button', { name: /go to next page/i })[0]
      );
      expect(
        screen.getByRole('spinbutton', {
          name: /current page/i,
        }).value
      ).toBe('2');
      await userEvent.type(
        screen.getByRole('textbox', {
          name: /text input/i,
        }),
        '10-0'
      );
      expect(
        screen.getByRole('spinbutton', {
          name: /current page/i,
        }).value
      ).toBe('1');
    });

    it('should paginate to 1 when removing filters', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map(() =>
            [...new Array(2)].map((_e, cell) => `item-${cell}`)
          )}
          filters={[{ index: 0 }, { index: 1 }]}
        />
      );

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /text input/i,
        }),
        'item'
      );
      await userEvent.click(
        screen.getAllByRole('button', { name: /go to next page/i })[0]
      );
      expect(
        screen.getByRole('spinbutton', {
          name: /current page/i,
        }).value
      ).toBe('2');
      await userEvent.click(
        screen.getByRole('button', {
          name: /close item/i,
        })
      );
      expect(
        screen.getByRole('spinbutton', {
          name: /current page/i,
        }).value
      ).toBe('1');
    });

    it('should change per page count', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map((_e, index) =>
            [...new Array(2)].map((_e, cell) => `${index}-${cell}`)
          )}
        />
      );

      await userEvent.click(
        screen.getAllByRole('button', { name: /items per page/i })[0]
      );
      await userEvent.click(
        screen.getByRole('menuitem', {
          name: /20 per page/i,
        })
      );
      expect(screen.getAllByRole('row')).toHaveLength(21); // including header
    });

    it('should paginate to last page', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map((_e, index) =>
            [...new Array(2)].map((_e, cell) => `${index}-${cell}`)
          )}
        />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /go to last page/i,
        })
      );
      expect(screen.getAllByRole('row')).toHaveLength(11); // including header
      expect(
        screen.getAllByRole('row').map((element) => element.textContent)
      ).toEqual([
        'One cellSecond one',
        '40-040-1',
        '41-041-1',
        '42-042-1',
        '43-043-1',
        '44-044-1',
        '45-045-1',
        '46-046-1',
        '47-047-1',
        '48-048-1',
        '49-049-1',
      ]);
    });

    it('should change per page count - bottom pagination', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map((_e, index) =>
            [...new Array(2)].map((_e, cell) => `${index}-${cell}`)
          )}
        />
      );

      await userEvent.click(
        screen.getAllByRole('button', { name: /items per page/i })[1]
      );
      await userEvent.click(
        screen.getByRole('menuitem', {
          name: /20 per page/i,
        })
      );
      expect(screen.getAllByRole('row')).toHaveLength(21); // including header
    });

    it('should filter away all items', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map(() => [...new Array(2)])}
          filters={[{ index: 0 }, { index: 1 }]}
        />
      );

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /text input/i,
        }),
        'something'
      );
      expect(screen.getAllByRole('row')).toHaveLength(1); // including header
    });

    it('should filter away items but left one', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map((_e, index) =>
            [...new Array(2)].map((_e, cell) => `${index}-${cell}`)
          )}
          filters={[{ index: 0 }, { index: 1 }]}
        />
      );

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /text input/i,
        }),
        '10-0'
      );
      expect(screen.getAllByRole('row')).toHaveLength(2); // including header
    });

    it('should remove filter chip', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map(() => [...new Array(2)])}
          filters={[{ index: 0 }, { index: 1 }]}
        />
      );

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /text input/i,
        }),
        'something'
      );
      expect(screen.getAllByRole('row')).toHaveLength(1); // including header
      await userEvent.click(
        screen.getByRole('button', {
          name: /close something/i,
        })
      );
      expect(screen.getAllByRole('row')).toHaveLength(11); // including header
    });

    it('should add checkbox filter', async () => {
      render(
        <InfoTable
          cells={[{ title: 'One cell' }, 'Second one']}
          rows={[...new Array(50)].map((_e, index) =>
            [...new Array(2)].map((_e, cell) => `${index}-${cell}`)
          )}
          filters={[{ type: 'checkbox', options: [{ label: 'ff' }] }]}
        />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /options menu/i,
        })
      );
      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /ff/i,
        })
      );
      expect(screen.getAllByRole('row')).toHaveLength(1); // including header
    });
  });
});
