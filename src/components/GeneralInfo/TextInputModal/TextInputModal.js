import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';

export default class TextInputModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.isOpen) {
      return { value: undefined };
    }

    if (state.value !== undefined) {
      return null;
    }

    return {
      value: props.value || '',
    };
  }

  render() {
    const {
      title,
      isOpen,
      onCancel,
      onSubmit,
      ariaLabel,
      modalOuiaId,
      cancelOuiaId,
      confirmOuiaId,
      inputOuiaId,
    } = this.props;
    const { value } = this.state;

    return (
      <Modal
        variant="small"
        title={title}
        className="ins-c-inventory__detail--edit"
        aria-label={ariaLabel ? `${ariaLabel} - modal` : 'input modal'}
        ouiaId={modalOuiaId}
        isOpen={isOpen}
        onClose={(event) => onCancel(event)}
        actions={[
          <Button
            key="confirm"
            data-action="confirm"
            variant="primary"
            onClick={() => onSubmit(this.state.value?.trim())}
            ouiaId={confirmOuiaId}
            isDisabled={
              this.props.value === this.state.value ||
              this.state.value?.trim().length === 0
            }
          >
            Save
          </Button>,
          <Button
            key="cancel"
            data-action="cancel"
            variant="link"
            onClick={onCancel}
            ouiaId={cancelOuiaId}
          >
            Cancel
          </Button>,
        ]}
      >
        <TextInput
          value={value}
          type="text"
          ouiaId={inputOuiaId}
          onChange={(_event, value) => this.setState({ value })}
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
      </Modal>
    );
  }
}

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

TextInputModal.defaultProps = {
  onCancel: () => undefined,
  onSubmit: () => undefined,
  isOpen: false,
  title: '',
  ariaLabel: 'input text',
};
