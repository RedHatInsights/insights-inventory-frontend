import React from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import InfoTable from '../GeneralInfo/InfoTable';

export interface ModalData {
  cells: Array<{ title: string }>;
  rows: Array<Array<string | Record<string, unknown>>>;
  expandable: boolean;
  filters: Array<{
    index?: number;
    title?: string;
    type?: string;
    options?: Array<{ value?: React.ReactNode; label?: React.ReactNode }>;
  }>;
}

export interface SystemDetailsModalProps {
  isModalOpen: boolean;
  modalTitle?: string;
  modalVariant?: 'small' | 'medium' | 'large';
  modalData: ModalData;
  onSort?: () => void;
  handleModalToggle: () => void;
}

/**
 * Shared modal component for displaying system details information in a table format.
 * Used by both Overview and Details tabs to show expandable data like CPU flags,
 * network interfaces, OS packages, etc.
 */
const SystemDetailsModal = ({
  isModalOpen,
  modalTitle,
  modalVariant,
  modalData,
  onSort,
  handleModalToggle,
}: SystemDetailsModalProps) => {
  return (
    <Modal
      aria-labelledby="system-details-modal-title"
      isOpen={isModalOpen}
      onClose={handleModalToggle}
      className="ins-c-inventory__detail--dialog"
      variant={modalVariant}
    >
      <ModalHeader
        title={
          <span id="system-details-modal-title">
            {modalTitle || 'System details'}
          </span>
        }
      />
      <ModalBody>
        <InfoTable
          cells={modalData.cells as []}
          rows={modalData.rows as []}
          expandable={modalData.expandable}
          onSort={onSort as undefined}
          filters={modalData.filters as []}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleModalToggle}
          data-testid="primary-close"
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SystemDetailsModal;
