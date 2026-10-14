import React, { useEffect, useState } from 'react';
import { ProgressStep, ProgressStepper } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import FirstStep from './FirstStep/FirstStep';
import SecondStep from './SecondStep';
import ThirdStep from './ThirdStep';
import RegAssistantFooter from './RegAssistantFooter';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { fetchActivationKeys } from '../../api';
import { dispatchNotification } from '../../Utilities/Dispatcher';
import { emptyActivationKeys } from '../../constants';
import CreateActivationKeyModal from './CreateActivationKeyModal';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const RegProgessStepper = () => {
  const chrome = useChrome();
  const [step, setStep] = useState(0);
  const [selectedKey, setSelectedKey] = useState('Select activation key');
  const [operatingSystem, setOperatingSystem] = useState();
  const [orgId, setOrgId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdKeyName, setKeyName] = useState();
  const [keys, setKeys] = useState();
  const axios = useAxiosWithPlatformInterceptors();
  const addNotification = useAddNotification();

  const handleFetchKeys = async () => {
    const fetchedKeys = await fetchActivationKeys(axios);

    if (fetchedKeys.body) {
      const keysList = fetchedKeys.body.length
        ? fetchedKeys.body
        : emptyActivationKeys;

      setKeys(keysList);
    } else if (fetchedKeys.error) {
      dispatchNotification(
        {
          variant: 'danger',
          title: 'Error',
          description: fetchedKeys.error.message,
          dismissable: true,
          autoDismiss: false,
        },
        addNotification,
      );

      return fetchedKeys.error;
    }
  };

  const fetchOrgId = async () => {
    const user = await chrome.auth.getUser();
    setOrgId(user.identity.org_id);
  };

  useEffect(() => {
    fetchOrgId();
  }, []);

  const setVariant = (value) => {
    if (step === value) {
      return 'info';
    } else if (step > value) {
      return 'success';
    } else if (step < value) {
      return 'default';
    }
  };

  return (
    <React.Fragment>
      {isModalOpen && (
        <CreateActivationKeyModal
          {...{ handleFetchKeys, isModalOpen, setIsModalOpen, setKeyName }}
        />
      )}
      <ProgressStepper isVertical>
        <ProgressStep
          className="progress-step-font-weight"
          isCurrent={step === 0}
          description={
            <FirstStep
              createdKeyName={createdKeyName}
              handleFetchKeys={handleFetchKeys}
              keys={keys}
              selectedKey={selectedKey}
              setIsModalOpen={setIsModalOpen}
              setSelectedKey={setSelectedKey}
              setStep={setStep}
              step={step}
            />
          }
          variant={setVariant(0)}
        >
          Select activation key
        </ProgressStep>
        <ProgressStep
          className="progress-step-font-weight"
          isCurrent={step === 1}
          variant={setVariant(1)}
          description={
            step >= 1 && (
              <SecondStep
                operatingSystem={operatingSystem}
                setOperatingSystem={setOperatingSystem}
                setStep={setStep}
              />
            )
          }
        >
          {step >= 1 && 'Select operating system'}
        </ProgressStep>
        <ProgressStep
          className="progress-step-font-weight"
          isCurrent={step === 2}
          variant={setVariant(2)}
          description={
            step >= 2 && (
              <ThirdStep
                OperatingSystemComponent={operatingSystem.content}
                orgId={orgId}
                selectedKey={selectedKey}
                setStep={setStep}
              />
            )
          }
        >
          {step >= 2 && `Register ${operatingSystem.name}`}
        </ProgressStep>
      </ProgressStepper>
      {step >= 2 && <RegAssistantFooter operatingSystem={operatingSystem} />}
    </React.Fragment>
  );
};

export default RegProgessStepper;
