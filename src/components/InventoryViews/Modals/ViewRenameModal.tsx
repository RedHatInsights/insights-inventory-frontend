import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';
import type { ViewOut } from '../../../api/inventoryViewsApi';
import { useUpdateViewMutation } from '../hooks/useUpdateViewMutation';
import { validateViewName } from '../hooks/useViewNameValidation';

export interface ViewRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewId: string;
  currentName: string;
  viewsList: ViewOut[];
  onSuccess?: (viewId: string, viewName: string) => void;
}

const ViewRenameModal = ({
  isOpen,
  onClose,
  viewId,
  currentName,
  viewsList,
  onSuccess,
}: ViewRenameModalProps) => {
  const [viewName, setViewName] = useState(currentName);
  const updateView = useUpdateViewMutation();
  const trimmedName = viewName.trim();
  const { isDuplicate, validated } = validateViewName(viewsList, trimmedName, {
    excludeViewId: viewId,
  });

  useEffect(() => {
    setViewName(currentName);
  }, [currentName]);

  const isLoading = updateView.isPending;
  const isUnchanged = trimmedName === currentName.trim();
  const canSave = !!trimmedName && !isDuplicate && !isLoading && !isUnchanged;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    updateView.mutate(
      {
        id: viewId,
        data: { name: trimmedName },
      },
      {
        onSuccess: (updatedView) => {
          onSuccess?.(updatedView.id, updatedView.name);
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    setViewName(currentName);
    onClose();
  };

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="rename-modal-title"
      ouiaId="inventory-rename-modal"
    >
      <ModalHeader title="Rename view" labelId="rename-modal-title" />
      <ModalBody>
        <p>Enter a new name for this view.</p>
        <br />
        <Form>
          <FormGroup label="View name" fieldId="view-name-input">
            <TextInput
              id="view-name-input"
              type="text"
              value={viewName}
              onChange={(_event, value) => setViewName(value)}
              isDisabled={isLoading}
              validated={validated}
              autoFocus
            />
            {isDuplicate && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">
                    A view with this name already exists.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="save"
          variant="primary"
          onClick={handleSave}
          isDisabled={!canSave}
          isLoading={isLoading}
        >
          Save
        </Button>
        <Button key="cancel" variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ViewRenameModal;
