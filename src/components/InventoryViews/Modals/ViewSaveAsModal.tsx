import React, { useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';
import type {
  ViewConfiguration,
  ViewOut,
} from '../../../api/inventoryViewsApi';
import { useCreateViewMutation } from '../hooks/useCreateViewMutation';
import { validateViewName } from '../hooks/useViewNameValidation';
import { ValidationErrorText } from './ValidationErrorText';

export interface ViewSaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfiguration: ViewConfiguration;
  viewsList: ViewOut[];
  onSuccess?: (viewId: string, viewName: string) => void;
}

const ViewSaveAsModal = ({
  isOpen,
  onClose,
  currentConfiguration,
  viewsList,
  onSuccess,
}: ViewSaveAsModalProps) => {
  const [viewName, setViewName] = useState('');
  const createView = useCreateViewMutation();
  const validation = validateViewName(viewsList, viewName);

  const handleSave = () => {
    if (!validation.isValid) {
      return;
    }

    createView.mutate(
      {
        name: viewName.trim(),
        configuration: currentConfiguration,
        org_wide: false, // Default to private view
      },
      {
        onSuccess: (newView) => {
          onSuccess?.(newView.id, newView.name);
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    setViewName(''); // Reset form
    onClose();
  };

  const isLoading = createView.isPending;
  const isSaveDisabled = !validation.isValid || isLoading;

  return (
    <Modal
      variant="small"
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="save-as-modal-title"
      ouiaId="inventory-save-as-modal"
    >
      <ModalHeader title="Save as" labelId="save-as-modal-title" />
      <ModalBody>
        <p>Create a new saved view with your current table configuration.</p>
        <br />
        <Form>
          <FormGroup label="View name" fieldId="view-name-input">
            <TextInput
              id="view-name-input"
              type="text"
              value={viewName}
              onChange={(_event, value) => setViewName(value)}
              isDisabled={isLoading}
              validated={validation.validated}
              autoFocus
            />
            <ValidationErrorText error={validation.error} />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="save"
          variant="primary"
          onClick={handleSave}
          isDisabled={isSaveDisabled}
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

export default ViewSaveAsModal;
