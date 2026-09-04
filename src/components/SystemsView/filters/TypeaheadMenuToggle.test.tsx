import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { MenuToggleElement } from '@patternfly/react-core';
import { TypeaheadMenuToggle } from './TypeaheadMenuToggle';

describe('TypeaheadMenuToggle', () => {
  const defaultProps = {
    toggleRef: createRef<MenuToggleElement>(),
    isExpanded: false,
    onToggleClick: jest.fn(),
    searchValue: '',
    onSearchChange: jest.fn(),
    placeholder: 'Search...',
    inputId: 'test-input',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with correct placeholder', () => {
    render(<TypeaheadMenuToggle {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should render with search value', () => {
    render(<TypeaheadMenuToggle {...defaultProps} searchValue="test query" />);

    expect(screen.getByDisplayValue('test query')).toBeInTheDocument();
  });

  it('should call onToggleClick when menu toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleClick = jest.fn();

    render(
      <TypeaheadMenuToggle {...defaultProps} onToggleClick={onToggleClick} />,
    );

    const toggleButton = screen.getByRole('button', { name: 'Menu toggle' });
    await user.click(toggleButton);

    expect(onToggleClick).toHaveBeenCalledTimes(1);
  });

  it('should call onSearchChange when typing in input', async () => {
    const user = userEvent.setup();
    const onSearchChange = jest.fn();

    render(
      <TypeaheadMenuToggle {...defaultProps} onSearchChange={onSearchChange} />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(onSearchChange).toHaveBeenCalledWith('t');
    expect(onSearchChange).toHaveBeenCalledWith('e');
    expect(onSearchChange).toHaveBeenCalledWith('s');
    expect(onSearchChange).toHaveBeenCalledWith('t');
  });

  it('should call onToggleClick when clicking input while closed', async () => {
    const user = userEvent.setup();
    const onToggleClick = jest.fn();

    render(
      <TypeaheadMenuToggle
        {...defaultProps}
        isExpanded={false}
        onToggleClick={onToggleClick}
      />,
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Called twice: once from onClick, once from onFocus
    expect(onToggleClick).toHaveBeenCalled();
  });

  it('should NOT call onToggleClick when clicking input while already open', async () => {
    const user = userEvent.setup();
    const onToggleClick = jest.fn();

    render(
      <TypeaheadMenuToggle
        {...defaultProps}
        isExpanded={true}
        onToggleClick={onToggleClick}
      />,
    );

    const input = screen.getByRole('textbox');
    await user.click(input);

    // Input click should NOT toggle when already open (stopPropagation behavior)
    expect(onToggleClick).not.toHaveBeenCalled();
  });

  it('should call onToggleClick when input receives focus while closed', () => {
    const onToggleClick = jest.fn();

    render(
      <TypeaheadMenuToggle
        {...defaultProps}
        isExpanded={false}
        onToggleClick={onToggleClick}
      />,
    );

    const input = screen.getByRole('textbox');
    input.focus();

    expect(onToggleClick).toHaveBeenCalledTimes(1);
  });

  it('should NOT call onToggleClick when input receives focus while already open', () => {
    const onToggleClick = jest.fn();

    render(
      <TypeaheadMenuToggle
        {...defaultProps}
        isExpanded={true}
        onToggleClick={onToggleClick}
      />,
    );

    const input = screen.getByRole('textbox');
    input.focus();

    // Focus should NOT toggle when already open
    expect(onToggleClick).not.toHaveBeenCalled();
  });

  it('should render textbox input', () => {
    render(<TypeaheadMenuToggle {...defaultProps} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should attach inputRef to the input element', () => {
    const inputRef = createRef<HTMLInputElement>();

    render(<TypeaheadMenuToggle {...defaultProps} inputRef={inputRef} />);

    expect(inputRef.current).toBeInstanceOf(HTMLInputElement);
    expect(inputRef.current).toBe(screen.getByRole('textbox'));
  });

  it('should render with aria-expanded true when expanded', () => {
    render(<TypeaheadMenuToggle {...defaultProps} isExpanded={true} />);

    const toggleButton = screen.getByRole('button', { name: 'Menu toggle' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('should render with aria-expanded false when collapsed', () => {
    render(<TypeaheadMenuToggle {...defaultProps} isExpanded={false} />);

    const toggleButton = screen.getByRole('button', { name: 'Menu toggle' });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });
});
