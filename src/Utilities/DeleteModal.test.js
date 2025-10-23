import React from 'react';
import DeleteModal from './DeleteModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('DeleteModal', () => {
  describe('DOM', () => {
    it('should render correctly with one system', () => {
      render(
        <DeleteModal
          currentSystems={{ display_name: 'something' }}
          isModalOpen
        />,
      );

      screen.getByText(/Delete system from inventory\?/i);
      screen.getByText(
        /something will be removed from all localhost:5000 applications and services/i,
      );
    });

    it('should render correctly with multiple systems', () => {
      render(
        <DeleteModal
          currentSystems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
        />,
      );

      screen.getByText(/Delete systems from inventory\?/i);
      screen.getByText(
        /2 systems will be removed from all localhost:5000 applications and services/i,
      );
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
          currentSystems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
          handleModalToggle={onClose}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call close on cancel click', async () => {
      const onClose = jest.fn();
      render(
        <DeleteModal
          currentSystems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
          handleModalToggle={onClose}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onConfirm when delete is clicked', async () => {
      const onConfirm = jest.fn();
      render(
        <DeleteModal
          currentSystems={[
            { display_name: 'something' },
            { display_name: 'another' },
          ]}
          isModalOpen
          onConfirm={onConfirm}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
