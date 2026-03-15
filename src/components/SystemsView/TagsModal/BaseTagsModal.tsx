import React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';

export interface BaseTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /**
   * When true (default), search and pagination in the table body are client-controlled on the provided tag list.
   * Set false when the child table uses server-driven search/pagination (e.g. inventory-wide query).
   */
  isClientControlled?: boolean;
  /** When set, footer shows Confirmation btn and Cancel. */
  onConfirm?: () => void;
  /** Used with `onConfirm`: when false, Apply is disabled. */
  isDirty?: boolean;
  children: React.ReactNode;
}

export const BaseTagsModal = ({
  isOpen,
  onClose,
  title,
  isClientControlled = true,
  children,
  onConfirm,
  isDirty = false,
}: BaseTagsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="medium"
      className={'ins-c-tag-modal'}
    >
      <ModalHeader title={title} />
      <ModalBody>
        <div
          className="ins-c-tags-modal-body"
          data-tags-modal-client-controlled={isClientControlled}
        >
          {children}
        </div>
      </ModalBody>
      <ModalFooter>
        {onConfirm ? (
          <Flex>
            <FlexItem>
              <Button
                variant="primary"
                isDisabled={!isDirty}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Apply
              </Button>
            </FlexItem>
            <FlexItem>
              <Button variant="link" onClick={onClose}>
                Cancel
              </Button>
            </FlexItem>
          </Flex>
        ) : (
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
