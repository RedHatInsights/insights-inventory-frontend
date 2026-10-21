import React from 'react';
import PropTypes from 'prop-types';

const ThirdStep = ({
  OperatingSystemComponent,
  orgId,
  selectedKey,
  setStep,
}) => {
  return (
    <React.Fragment>
      {
        <OperatingSystemComponent
          orgId={orgId}
          selectedKey={selectedKey}
          setStep={setStep}
        />
      }
    </React.Fragment>
  );
};

ThirdStep.propTypes = {
  OperatingSystemComponent: PropTypes.node,
  orgId: PropTypes.string,
  selectedKey: PropTypes.string,
  setStep: PropTypes.func,
};

export default ThirdStep;
