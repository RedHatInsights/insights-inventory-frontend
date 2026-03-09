import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TagsModalTable } from './TagsModalTable';
import { TAGS_100 } from './__fixtures__/tags';

describe('TagsModalTable', () => {
  it('should render first page of tags', () => {
    render(<TagsModalTable tags={TAGS_100} />);

    expect(
      screen.getByRole('columnheader', { name: /name/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /value/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: /tag source/i }),
    ).toBeInTheDocument();

    // First tag
    expect(screen.getByText('key-0')).toBeInTheDocument();
    expect(screen.getByText('value-0')).toBeInTheDocument();
    expect(screen.getByText('namespace-0')).toBeInTheDocument();
    // Last tag
    expect(screen.getByText('key-49')).toBeInTheDocument();
    expect(screen.getByText('value-49')).toBeInTheDocument();
    expect(screen.getByText('namespace-49')).toBeInTheDocument();

    const paginationRangeButtons = screen.getAllByRole('button', {
      name: /1 - 50 of 100/,
    });
    expect(paginationRangeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('should paginate to second page', async () => {
    const user = userEvent.setup();
    render(<TagsModalTable tags={TAGS_100} />);

    const nextPageButtons = screen.getAllByRole('button', {
      name: /go to next page/i,
    });
    await user.click(nextPageButtons[0]);

    expect(screen.getByText('key-50')).toBeInTheDocument();
    expect(screen.getByText('value-50')).toBeInTheDocument();
    expect(screen.getByText('namespace-50')).toBeInTheDocument();
    expect(screen.getByText('key-99')).toBeInTheDocument();
    expect(screen.getByText('value-99')).toBeInTheDocument();
    expect(screen.getByText('namespace-99')).toBeInTheDocument();
  });

  it('should search over tags', async () => {
    const user = userEvent.setup();
    render(<TagsModalTable tags={TAGS_100} />);

    const nextPageButtons = screen.getAllByRole('button', {
      name: /go to next page/i,
    });
    await user.click(nextPageButtons[0]);
    expect(screen.queryByText('key-42')).not.toBeInTheDocument();

    const searchInput = screen.getByRole('textbox', {
      name: /tags search input/i,
    });
    await user.type(searchInput, 'key-42');

    expect(screen.getByText('key-42')).toBeInTheDocument();
    expect(screen.getByText('value-42')).toBeInTheDocument();
    expect(screen.getByText('namespace-42')).toBeInTheDocument();

    // Others are not visible
    expect(screen.queryByText('key-0')).not.toBeInTheDocument();
    expect(screen.queryByText('key-41')).not.toBeInTheDocument();
  });

  it('should render empty state component, when zero tags are found', () => {
    render(<TagsModalTable tags={[]} />);

    expect(
      screen.getByRole('heading', { name: /no matching tags found/i }),
    ).toBeInTheDocument();
  });
});
