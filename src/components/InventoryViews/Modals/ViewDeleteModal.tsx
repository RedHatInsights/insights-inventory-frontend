import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { useDeleteViewMutation } from '../hooks/useDeleteViewMutation';

export interface ViewDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewId: string;
  viewName: string;
  onSuccess?: (viewId: string) => void;
}

const ViewDeleteModal = ({
  isOpen,
  onClose,
  viewId,
  viewName,
  onSuccess,
}: ViewDeleteModalProps) => {
  const deleteView = useDeleteViewMutation();

  const handleDelete = () => {
    deleteView.mutate(viewId, {
      onSuccess: () => {
        onSuccess?.(viewId);
        onClose();
      },
    });
  };

  const isLoading = deleteView.isPending;

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="delete-view-modal-title"
      ouiaId="inventory-delete-view-modal"
    >
      <ModalHeader
        title="Delete view"
        labelId="delete-view-modal-title"
        titleIconVariant="warning"
      />
      <ModalBody>
        <p>&ldquo;{viewName}&rdquo; will be permanently deleted.</p>
      </ModalBody>
      <ModalFooter>
        <Button
          key="delete"
          variant="danger"
          onClick={handleDelete}
          isDisabled={isLoading}
          isLoading={isLoading}
        >
          Delete
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewDeleteModal;
