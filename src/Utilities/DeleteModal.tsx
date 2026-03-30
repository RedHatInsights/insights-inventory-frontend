import React from 'react';
import {
  Button,
  ClipboardCopy,
  Level,
  LevelItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { System } from '../components/SystemsView/hooks/useSystemsQuery';

export interface DeleteModalProps {
  handleModalToggle?: (open: boolean) => void;
  isModalOpen?: boolean;
  currentSystems?: System | System[];
  onConfirm?: () => void;
}

const DeleteModal = ({
  handleModalToggle = () => undefined,
  isModalOpen = false,
  currentSystems,
  onConfirm = () => undefined,
}: DeleteModalProps) => {
  let systemToRemove: string | undefined;
  let systemLabel: 'system' | 'systems' = 'system';
  let systemPronoun: 'this' | 'these' = 'this';

  if (Array.isArray(currentSystems)) {
    systemToRemove =
      currentSystems.length === 1
        ? (currentSystems[0].display_name ?? undefined)
        : `${currentSystems.length} systems`;
    systemLabel = currentSystems.length === 1 ? 'system' : 'systems';
    systemPronoun = currentSystems.length === 1 ? 'this' : 'these';
  } else {
    systemToRemove = currentSystems?.display_name ?? undefined;
  }

  return (
    <Modal
      variant="small"
      className="ins-c-inventory__table--remove sentry-mask data-hj-suppress"
      ouiaId="inventory-delete-modal"
      isOpen={isModalOpen}
      onClose={() => handleModalToggle(false)}
    >
      <ModalHeader
        title={`Delete ${Array.isArray(currentSystems) && currentSystems.length > 1 ? 'systems' : 'system'} from inventory?`}
        titleIconVariant="warning"
      />
      <ModalBody>
        <Split hasGutter>
          <SplitItem isFilled>
            <Stack hasGutter>
              <StackItem>
                {systemToRemove} will be removed from all {location.host}{' '}
                applications and services. You need to re-register the{' '}
                {systemLabel} to add it back to your inventory.
              </StackItem>
              <StackItem>
                To disable the daily upload for {systemPronoun} {systemLabel},
                use the following command:
              </StackItem>
              <StackItem>
                <ClipboardCopy isReadOnly isCode>
                  insights-client --unregister
                </ClipboardCopy>
              </StackItem>
            </Stack>
          </SplitItem>
        </Split>
      </ModalBody>
      <ModalFooter>
        <Level hasGutter>
          <LevelItem>
            <Button
              variant="danger"
              ouiaId="confirm-inventory-delete"
              data-testid="confirm-inventory-delete"
              onClick={onConfirm}
            >
              Delete
            </Button>
            <Button
              variant="link"
              ouiaId="cancel-inventory-delete"
              onClick={() => handleModalToggle(false)}
            >
              Cancel
            </Button>
          </LevelItem>
        </Level>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
