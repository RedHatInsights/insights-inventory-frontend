import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

const TextInputModal = ({
  title = '',
  isOpen = false,
  onCancel = () => undefined,
  onSubmit = () => undefined,
  ariaLabel = 'input text',
  modalOuiaId,
  cancelOuiaId,
  confirmOuiaId,
  inputOuiaId,
  value: initialValue,
}) => {
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    if (!isOpen) {
      setValue(undefined);
    } else if (value === undefined) {
      setValue(initialValue || '');
    }
  }, [isOpen, initialValue, value]);

  return (
    <Modal
      variant="small"
      className="ins-c-inventory__detail--edit"
      aria-label={ariaLabel ? `${ariaLabel} - modal` : 'input modal'}
      ouiaId={modalOuiaId}
      isOpen={isOpen}
      onClose={(event) => onCancel(event)}
    >
      <ModalHeader title={title} />
      <ModalBody>
        <TextInput
          value={value}
          type="text"
          ouiaId={inputOuiaId}
          onChange={(_event, value) => setValue(value)}
          aria-label={ariaLabel}
          validated={value?.trim().length === 0 && ValidatedOptions.error}
        />
        <FormHelperText>
          <HelperText id="helper-text2" aria-live="polite">
            {value?.trim().length === 0 && (
              <HelperTextItem variant="error">
                Name cannot be blank
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          data-action="confirm"
          variant="primary"
          onClick={() => onSubmit(value?.trim())}
          ouiaId={confirmOuiaId}
          isDisabled={value === initialValue || value?.trim().length === 0}
        >
          Save
        </Button>
        <Button
          key="cancel"
          data-action="cancel"
          variant="link"
          onClick={onCancel}
          ouiaId={cancelOuiaId}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

TextInputModal.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  ariaLabel: PropTypes.string,
  modalOuiaId: PropTypes.string,
  cancelOuiaId: PropTypes.string,
  confirmOuiaId: PropTypes.string,
  inputOuiaId: PropTypes.string,
  value: PropTypes.string,
};

export default TextInputModal;
