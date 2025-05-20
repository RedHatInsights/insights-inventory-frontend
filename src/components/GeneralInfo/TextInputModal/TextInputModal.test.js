import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TextInputModal from './TextInputModal';

describe('TextInputModal', () => {
  describe('State management with props', () => {
    it('modal should not be present in DOM when closed', () => {
      const { rerender } = render(<TextInputModal isOpen={true} value="foo" />);
      rerender(<TextInputModal isOpen={false} value="foo" />);

      const input = screen.queryByRole('textbox', {
        name: /input text/i,
      });
      expect(input).not.toBeInTheDocument();
    });

    it('should have correct value when modal is reopened', () => {
      const { rerender } = render(<TextInputModal isOpen={true} value="foo" />);
      rerender(<TextInputModal isOpen={false} value="foo" />);
      rerender(<TextInputModal isOpen={true} value="bar" />);

      const input = screen.getByRole('textbox', {
        name: /input text/i,
      });
      expect(input).toHaveValue('bar');
    });

    it('should set value to initialValue when modal is opened', () => {
      render(<TextInputModal isOpen={true} value="foo" />);

      const input = screen.getByRole('textbox', {
        name: /input text/i,
      });

      expect(input).toHaveValue('foo');
    });

    it('should set value to empty string if initialValue is not provided', () => {
      render(<TextInputModal isOpen={true} />);

      const input = screen.getByRole('textbox', {
        name: /input text/i,
      });

      expect(input).toHaveValue('');
    });
  });

  describe('render', () => {
    it('should render without any props', () => {
      const view = render(<TextInputModal />);
      expect(view.baseElement).toMatchSnapshot();
    });

    it('should render open', () => {
      const view = render(<TextInputModal isOpen />);
      expect(view.baseElement).toMatchSnapshot();
    });

    it('should render title', () => {
      const view = render(<TextInputModal isOpen title="Some title" />);
      expect(view.baseElement).toMatchSnapshot();
    });

    it('should render aria label', () => {
      const view = render(
        <TextInputModal isOpen ariaLabel="Some aria label" />,
      );
      expect(view.baseElement).toMatchSnapshot();
    });
  });

  describe('API', () => {
    it('onCancel should be called', async () => {
      const onCancel = jest.fn();
      render(<TextInputModal isOpen onCancel={onCancel} />);

      await userEvent.click(
        screen.getByRole('button', {
          name: /cancel/i,
        }),
      );
      expect(onCancel).toBeCalled();
    });

    it('onSubmit should be called with trimmed string', async () => {
      const onSubmit = jest.fn();
      render(<TextInputModal isOpen onSubmit={onSubmit} />);

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /input text/i,
        }),
        'some ',
      );

      const submitButton = screen.getByRole('button', {
        name: /save/i,
      });

      await userEvent.click(submitButton);
      expect(onSubmit).toBeCalledWith('some');
    });

    it('submitButton should be disabled', async () => {
      const onSubmit = jest.fn();
      render(<TextInputModal isOpen onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', {
        name: /save/i,
      });

      /*eslint-disable jest-dom/prefer-enabled-disabled*/
      expect(submitButton).toHaveProperty('disabled');

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /input text/i,
        }),
        '  ',
      );

      expect(submitButton).toHaveProperty('disabled');
      /*eslint-enable jest-dom/prefer-enabled-disabled*/
    });

    it('X button should call onClose', async () => {
      const onCancel = jest.fn();
      render(<TextInputModal isOpen onCancel={onCancel} />);

      await userEvent.click(
        screen.getByRole('button', {
          name: /close/i,
        }),
      );
      expect(onCancel).toBeCalled();
    });
  });
});
