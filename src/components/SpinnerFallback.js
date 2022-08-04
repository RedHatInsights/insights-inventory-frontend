import React from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';

const Fallback = () => (
    <Bullseye>
        <Spinner size="xl" />
    </Bullseye>
);

export default Fallback;
