/* eslint-disable camelcase */
import React from 'react';
import DeleteModal from './DeleteModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('EntityTable', () => {
  describe('DOM', () => {
    it('should render correctly with no system', () => {
      const view = render(<DeleteModal />);

      expect(view.baseElement).toMatchSnapshot();
    });

    it('should render correctly with one system', () => {
      const view = render(
        <DeleteModal
          currentSytems={{ display_name: 'something' }}
          isModalOpen
        />
      );

      screen.getByText(
        /something will be removed from all localhost:5000 applications and services/i
      );
      expect(view.baseElement).toMatchSnapshot();
    });

    it('should render correctly with multiple systems', () => {
      const view = render(
        <DeleteModal
          currentSytems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
        />
      );

      screen.getByText(
        /2 systems will be removed from all localhost:5000 applications and services/i
      );
      expect(view.baseElement).toMatchSnapshot();
    });
  });

  describe('API', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call close on X click', async () => {
      const onClose = jest.fn();
      render(
        <DeleteModal
          currentSytems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
          handleModalToggle={onClose}
        />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /close/i,
        })
      );
      expect(onClose).toHaveBeenCalled();
    });

    it('should call close on cancel click', async () => {
      const onClose = jest.fn();
      render(
        <DeleteModal
          currentSytems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
          handleModalToggle={onClose}
        />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /cancel/i,
        })
      );
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onConfirm', async () => {
      const onConfirm = jest.fn();
      render(
        <DeleteModal
          currentSytems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
          onConfirm={onConfirm}
        />
      );

      await userEvent.click(
        screen.getByRole('button', {
          name: /remove/i,
        })
      );
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
