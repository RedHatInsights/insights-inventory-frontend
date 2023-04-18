import React from 'react';
import { Button, Text } from '@patternfly/react-core';
import PropTypes from 'prop-types';

export const CreateGroupButton = ({ closeModal }) => (
    <>
        <Text>Or</Text>
        <Button variant="secondary" className="pf-u-w-50" onClick={closeModal}>
        Create a new group
        </Button>
    </>
);

CreateGroupButton.propTypes = {
    closeModal: PropTypes.func
};
