import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { NameInlineEdit } from './NameInlineEdit';
import userEvent from '@testing-library/user-event';

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    esModule: true,
    usePermissionsWithContext: () => ({ hasAccess: true }),
  }),
);

jest.mock('react-redux', () => ({
  esModule: true,
  useSelector: () => ({}),
}));

const onSubmit = jest.fn(() => {});

describe('NameInlineEdit', () => {
  it('should render input text', () => {
    render(<NameInlineEdit textValue={'some-text'} writePermissions={true} />);

    expect(screen.getByText('some-text')).toBeVisible();
    expect(screen.getByRole('button', { name: /edit/i })).toBeVisible();
  });

  it('should open editing', async () => {
    render(<NameInlineEdit textValue={'some-text'} writePermissions={true} />);

    const editButton = screen.getByRole('button', { name: /edit/i });

    expect(screen.getByText('some-text')).toBeVisible();
    expect(editButton).toBeVisible();

    await userEvent.click(editButton);
    const textbox = await screen.findByRole('textbox');

    expect(textbox).toBeVisible();
    expect(textbox).toHaveValue('some-text');
  });

  it('should have submit button disabled with empty textbox', async () => {
    render(<NameInlineEdit textValue={'some-text'} writePermissions={true} />);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    const textbox = await screen.findByRole('textbox');

    await userEvent.clear(textbox);

    const sumbitButton = screen.getByRole('button', { name: /submit/i });
    expect(sumbitButton).toBeDisabled();
  });

  it('should submit changes', async () => {
    render(
      <NameInlineEdit
        textValue={'some-text'}
        writePermissions={true}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    const textbox = await screen.findByRole('textbox');

    await userEvent.clear(textbox);
    await userEvent.type(textbox, 'some');

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeEnabled();

    await userEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith('some');
  });

  it('should close with cancel button', async () => {
    render(
      <NameInlineEdit
        textValue={'some-text'}
        writePermissions={true}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    const textbox = await screen.findByRole('textbox');

    await userEvent.click(textbox);
    await userEvent.keyboard('123');

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });

    await userEvent.click(cancelButton);

    expect(textbox).not.toBeVisible();
  });

  it('should reset changed value with cancel', async () => {
    render(
      <NameInlineEdit
        textValue={'some-text'}
        writePermissions={true}
        onSubmit={onSubmit}
      />,
    );

    const editButton = screen.getByRole('button', { name: /edit/i });

    await userEvent.click(editButton);
    const textbox = await screen.findByRole('textbox');

    await userEvent.click(textbox);
    await userEvent.keyboard('123');

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });

    await userEvent.click(cancelButton);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(await screen.findByRole('textbox')).toHaveValue('some-text');
  });
});
