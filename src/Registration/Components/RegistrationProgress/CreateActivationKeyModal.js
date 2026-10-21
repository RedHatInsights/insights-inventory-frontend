import React from 'react';
import PropTypes from 'prop-types';
import { AsyncComponent } from '@redhat-cloud-services/frontend-components/AsyncComponent';
import SuccessPage from './FirstStep/SuccessPage';

const CreateActivationKeyModal = ({
  handleFetchKeys,
  isModalOpen,
  setIsModalOpen,
  setKeyName,
}) => {
  return (
    <AsyncComponent
      scope="activationKeys"
      module="./CreateActivationKeyWizard"
      handleModalToggle={setIsModalOpen}
      isOpen={isModalOpen}
      CustomSuccessPage={(props) => (
        <SuccessPage
          handleFetchKeys={handleFetchKeys}
          setKeyName={setKeyName}
          {...props}
        />
      )}
    />
  );
};

CreateActivationKeyModal.propTypes = {
  handleFetchKeys: PropTypes.func,
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  setKeyName: PropTypes.func,
};

export default CreateActivationKeyModal;
