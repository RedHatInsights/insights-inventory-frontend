import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ClipboardCopy,
  Icon,
  Level,
  LevelItem,
  Modal,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

const DeleteModal = ({
  handleModalToggle,
  isModalOpen,
  currentSytems,
  onConfirm,
}) => {
  let systemToRemove;
  let systemLabel = 'system';
  if (Array.isArray(currentSytems)) {
    systemToRemove =
      currentSytems.length === 1
        ? currentSytems[0].display_name
        : `${currentSytems.length} systems`;
    systemLabel = currentSytems.length === 1 ? systemLabel : 'systems';
  } else {
    systemToRemove = currentSytems.display_name;
  }

  return (
    <Modal
      variant="small"
      title="Delete from inventory"
      className="ins-c-inventory__table--remove sentry-mask data-hj-suppress"
      ouiaId="inventory-delete-modal"
      isOpen={isModalOpen}
      onClose={() => handleModalToggle(false)}
      appendTo={
        document.getElementsByClassName('inventory')[0] || document.body
      }
    >
      <Split hasGutter>
        <SplitItem>
          <Icon size="xl" status="warning">
            <ExclamationTriangleIcon />
          </Icon>
        </SplitItem>
        <SplitItem isFilled>
          <Stack hasGutter>
            <StackItem>
              {systemToRemove} will be removed from all {location.host}{' '}
              applications and services. You need to re-register the{' '}
              {systemLabel} to add it back to your inventory.
            </StackItem>
            <StackItem>
              To disable the daily upload for this {systemLabel}, use the
              following command:
            </StackItem>
            <StackItem>
              <ClipboardCopy>insights-client --unregister</ClipboardCopy>
            </StackItem>
          </Stack>
        </SplitItem>
      </Split>
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
    </Modal>
  );
};

const ActiveSystemProp = PropTypes.shape({
  id: PropTypes.string,
  displayName: PropTypes.string,
});

DeleteModal.propTypes = {
  isModalOpen: PropTypes.bool,
  currentSytems: PropTypes.oneOfType([
    ActiveSystemProp,
    PropTypes.arrayOf(ActiveSystemProp),
  ]),
  handleModalToggle: PropTypes.func,
  onConfirm: PropTypes.func,
};

DeleteModal.defaultProps = {
  isModalOpen: false,
  currentSytems: {},
  handleModalToggle: () => undefined,
  onConfirm: () => undefined,
};

export default DeleteModal;
