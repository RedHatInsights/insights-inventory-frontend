import React from 'react';
import PropTypes from 'prop-types';
import {
    Modal,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Level,
    LevelItem,
    Button,
    ClipboardCopy
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { FormattedMessage } from 'react-intl';
import { defaultMessages } from '@redhat-cloud-services/frontend-components-translations';
import messages from '../messages';

const DeleteModal = ({ handleModalToggle, isModalOpen, currentSytem, onConfirm }) => (
    <Modal
        isSmall
        title="Remove from inventory"
        className="ins-c-inventory__table--remove"
        isOpen={isModalOpen}
        onClose={() => handleModalToggle(false)}
    >
        <Split gutter="md">
            <SplitItem><ExclamationTriangleIcon size="xl" className="ins-m-alert" /></SplitItem>
            <SplitItem isFilled>
                <Stack gutter="md">
                    <StackItem>
                        <FormattedMessage
                            {...messages.systemRemoveInfo}
                            values={{
                                systemToRemove: Array.isArray(currentSytem) ?
                                    currentSytem.length === 1 ?
                                        currentSytem[0].display_name :
                                        currentSytem.length :
                                    currentSytem.displayName,
                                host: location.host,
                                system: Array.isArray(currentSytem) ? currentSytem.length : 1
                            }}
                        />
                    </StackItem>
                    <StackItem>
                        <FormattedMessage
                            {...messages.disableDailyUploads}
                            values={{
                                system: Array.isArray(currentSytem) ? currentSytem.length : 1
                            }}
                        />
                    </StackItem>
                    <StackItem>
                        <ClipboardCopy>insights-client --unregister</ClipboardCopy>
                    </StackItem>
                </Stack>
            </SplitItem>
        </Split>
        <Level gutter="md">
            <LevelItem>
                <Button variant="danger" onClick={onConfirm}>
                    <FormattedMessage
                        {...defaultMessages.remove}
                    />
                </Button>
                <Button variant="link" onClick={() => handleModalToggle(false)}>
                    <FormattedMessage
                        {...defaultMessages.cancel}
                    />
                </Button>
            </LevelItem>
        </Level>
    </Modal>
);

const ActiveSystemProp = PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string
});

DeleteModal.propTypes = {
    isModalOpen: PropTypes.bool,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func
    }),
    currentSytem: PropTypes.oneOfType([ActiveSystemProp, PropTypes.arrayOf(ActiveSystemProp)]),
    handleModalToggle: PropTypes.func,
    onConfirm: PropTypes.func
};

DeleteModal.defaultProps = {
    isModalOpen: false,
    currentSytem: {},
    handleModalToggle: () => undefined,
    onConfirm: () => undefined
};

export default DeleteModal;
