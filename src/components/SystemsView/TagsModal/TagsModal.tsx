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
import TagsModalTable from './TagsModalTable';
import { System } from '../hooks/useSystemsQuery';

interface TagsModalProps {
  isOpen: boolean;
  system: System;
  onClose: () => void;
  hasConfirm?: boolean;
}

export const TagsModal = ({
  isOpen,
  system,
  onClose,
  hasConfirm = false,
}: TagsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="medium"
      className={'ins-c-tag-modal'}
    >
      <ModalHeader
        title={
          system
            ? `${system.display_name} (${system.tags?.length})`
            : `All tags in inventory`
        }
      />
      <ModalBody>
        <TagsModalTable tags={system?.tags} />
      </ModalBody>
      <ModalFooter>
        {hasConfirm ? (
          <Flex>
            <FlexItem>
              <Button variant="primary" isDisabled={false} onClick={() => {}}>
                Apply tags
              </Button>
            </FlexItem>
            <FlexItem>
              <Button variant="link" onClick={onClose}>
                Cancel
              </Button>
            </FlexItem>
          </Flex>
        ) : (
          <Button variant="primary" isDisabled={false} onClick={onClose}>
            Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
