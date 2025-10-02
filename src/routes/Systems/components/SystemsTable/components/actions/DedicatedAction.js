import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@patternfly/react-core';

const DedicatedAction = ({ onClick = () => {}, selected = [] }) => {
  return (
    <Button
      isDisabled={!selected?.length}
      variant="primary"
      ouiaId="Primary"
      onClick={onClick}
    >
      Delete
    </Button>
  );
};

DedicatedAction.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.array,
};

export default DedicatedAction;
