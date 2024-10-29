import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import TextInputModal from './TextInputModal';

describe('TextInputModal', () => {
  describe('getDerivedStateFromProps', () => {
    it('should set state value to undefined', () => {
      expect(
        TextInputModal.getDerivedStateFromProps(
          {
            isOpen: false,
            value: 'some-value',
          },
          { value: 'test' }
        )
      ).toEqual({
        value: undefined,
      });
    });

    it('should keep the value same if isOpen set and state value set', () => {
      expect(
        TextInputModal.getDerivedStateFromProps(
          {
            isOpen: true,
            value: 'some-value',
          },
          { value: 'test' }
        )
      ).toBe(null);
    });

    it('should set the state value', () => {
      expect(
        TextInputModal.getDerivedStateFromProps(
          {
            isOpen: true,
            value: 'some-value',
          },
          { value: undefined }
        )
      ).toEqual({
        value: 'some-value',
      });
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
        <TextInputModal isOpen ariaLabel="Some aria label" />
      );
      expect(view.baseElement).toMatchSnapshot();
    });
  });

  describe('API', () => {
    it('getDerivedStateFromProps should be called', async () => {
      const getDerivedStateFromProps = jest.spyOn(
        TextInputModal,
        'getDerivedStateFromProps'
      );
      render(<TextInputModal isOpen />);

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /input text/i,
        }),
        'some'
      );
      expect(getDerivedStateFromProps).toBeCalled();
    });

    it('onCancel should be called', async () => {
      const onCancel = jest.fn();
      render(<TextInputModal isOpen onCancel={onCancel} />);

      await userEvent.click(
        screen.getByRole('button', {
          name: /cancel/i,
        })
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
        'some '
      );

      const submitButton = screen.getByRole('button', {
        name: /save/i,
      });

      await userEvent.click(submitButton);
      expect(onSubmit).toBeCalledWith('some');

      await userEvent.type(
        screen.getByRole('textbox', {
          name: /input text/i,
        }),
        ' some'
      );
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
        '  '
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
        })
      );
      expect(onCancel).toBeCalled();
    });
  });
});
