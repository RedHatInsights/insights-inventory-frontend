import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TAGS_SAMPLE } from './__fixtures__/tags';
import TagsModalTable from './TagsModalTable';

describe('TagsModalTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows error state when isError is true', () => {
    render(<TagsModalTable tags={[]} isError />);
    expect(
      screen.getByText('Unable to load tags', { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/error retrieving tags/i, { exact: false }),
    ).toBeInTheDocument();
  });

  it('shows loading state when isLoading', () => {
    render(<TagsModalTable tags={[]} isLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when there are no tags', () => {
    render(<TagsModalTable tags={[]} />);
    expect(screen.getByText(/No matching tags found/i)).toBeInTheDocument();
  });

  it('renders tag rows with column headers', () => {
    render(<TagsModalTable tags={TAGS_SAMPLE} />);
    expect(
      screen.getByRole('columnheader', { name: 'Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Value' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Tag source' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'key-0' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'value-0' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'namespace-0' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'key-1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'value-1' })).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'namespace-1' }),
    ).toBeInTheDocument();
  });

  it('filters rows client-side by search (case-insensitive)', async () => {
    const user = userEvent.setup();
    render(<TagsModalTable tags={TAGS_SAMPLE} />);
    const search = screen.getByRole('textbox', { name: /tags search input/i });
    await user.type(search, 'VALUE-1');
    expect(screen.getByRole('cell', { name: 'key-1' })).toBeInTheDocument();
    expect(
      screen.queryByRole('cell', { name: 'key-0' }),
    ).not.toBeInTheDocument();
  });

  it('clears client search via Reset', async () => {
    const user = userEvent.setup();
    render(<TagsModalTable tags={TAGS_SAMPLE} />);
    const search = screen.getByRole('textbox', { name: /tags search input/i });
    await user.type(search, 'nomatch');
    expect(screen.getByText(/No matching tags found/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('cell', { name: 'key-0' })).toBeInTheDocument();
  });

  it('delegates search to serverSearch.onChange when provided', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <TagsModalTable
        tags={TAGS_SAMPLE}
        serverSearch={{ value: '', onChange }}
      />,
    );
    const search = screen.getByRole('textbox', { name: /tags search input/i });
    await user.type(search, 'a');
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls.at(-1)[0];
    expect(lastCall).toBe('a');
  });

  it('shows BulkSelect when selection prop is provided', () => {
    const selection = {
      selected: [],
      setSelected: jest.fn(),
      onSelect: jest.fn(),
      isSelected: () => false,
    };
    render(<TagsModalTable tags={TAGS_SAMPLE} selection={selection} />);
    const toolbar = screen.getByTestId('tags-table-header-toolbar');
    expect(
      within(toolbar).getByRole('button', { name: /select/i }),
    ).toBeInTheDocument();
  });
});
