import React from 'react';
import PropTypes from 'prop-types';
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

const DeleteModal = ({
  handleModalToggle,
  isModalOpen,
  currentSystems,
  onConfirm,
}) => {
  let systemToRemove;
  let systemLabel = 'system';
  let systemPronoun = 'this';
  if (Array.isArray(currentSystems)) {
    systemToRemove =
      currentSystems.length === 1
        ? currentSystems[0].display_name
        : `${currentSystems.length} systems`;
    systemLabel = currentSystems.length === 1 ? systemLabel : 'systems';
    systemPronoun = currentSystems.length === 1 ? systemPronoun : 'these';
  } else {
    systemToRemove = currentSystems.display_name;
  }

  return (
    <Modal
      variant="small"
      className="ins-c-inventory__table--remove sentry-mask data-hj-suppress"
      ouiaId="inventory-delete-modal"
      isOpen={isModalOpen}
      onClose={() => handleModalToggle(false)}
      appendTo={
        document.getElementsByClassName('inventory')[0] || document.body
      }
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
                <ClipboardCopy>insights-client --unregister</ClipboardCopy>
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

const ActiveSystemProp = PropTypes.shape({
  id: PropTypes.string,
  displayName: PropTypes.string,
});

DeleteModal.propTypes = {
  isModalOpen: PropTypes.bool,
  currentSystems: PropTypes.oneOfType([
    ActiveSystemProp,
    PropTypes.arrayOf(ActiveSystemProp),
  ]),
  handleModalToggle: PropTypes.func,
  onConfirm: PropTypes.func,
};

DeleteModal.defaultProps = {
  isModalOpen: false,
  currentSystems: {},
  handleModalToggle: () => undefined,
  onConfirm: () => undefined,
};

export default DeleteModal;
