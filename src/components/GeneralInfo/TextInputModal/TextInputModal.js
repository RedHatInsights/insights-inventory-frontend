import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Button, Modal, TextInput } from '@patternfly/react-core';

const TextInputModal = ({
    title,
    isOpen,
    onCancel,
    onSubmit,
    ariaLabel,
    modalOuiaId,
    cancelOuiaId,
    confirmOuiaId,
    inputOuiaId
}) => {
    const [value, setValue] = useState();

    return (
        <Modal
            variant="small"
            title={ title }
            className="ins-c-inventory__detail--edit"
            aria-label={ ariaLabel ? `${ariaLabel} - modal` : 'input modal' }
            ouiaId={ modalOuiaId }
            isOpen={ isOpen }
            onClose={ event => onCancel(event) }
            actions={ [
                <Button key="cancel" data-action="cancel" variant="secondary" onClick={ onCancel } ouiaId={ cancelOuiaId }>
                        Cancel
                </Button>,
                <Button
                    key="confirm"
                    data-action="confirm"
                    variant="primary"
                    onClick={ () => onSubmit(value) }
                    ouiaId={ confirmOuiaId }
                >
                        Save
                </Button>
            ] }
        >
            <TextInput
                value={ value }
                type="text"
                ouiaId={ inputOuiaId }
                onChange={ value => setValue(value) }
                aria-label={ ariaLabel  }
            />
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

TextInputModal.defaultProps = {
  onCancel: () => undefined,
  onSubmit: () => undefined,
  isOpen: false,
  title: '',
  ariaLabel: 'input text',
};

export default TextInputModal;
