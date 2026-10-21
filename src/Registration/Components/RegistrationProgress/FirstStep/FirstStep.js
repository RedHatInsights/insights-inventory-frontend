import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Icon,
  MenuFooter,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import {
  ExternalLinkAltIcon,
  PlusCircleIcon,
  SyncAltIcon,
  LockIcon,
} from '@patternfly/react-icons';
import { InsightsLink } from '@redhat-cloud-services/frontend-components/InsightsLink';
import { loadingActivationKeys } from '../../../constants';
import { ShowSelectedActivationKey } from './ShowSelectedActivationKey';
import { dispatchNotification } from '../../../Utilities/Dispatcher';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { createActivationKey } from '../../../api';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { v4 as uuidv4 } from 'uuid';
import { useActivationKeyPermissions } from '../../../hooks/useActivationKeyPermissions';

const ActivationKeysList = ({ keys }) => {
  return keys.map((key, idx) => (
    <SelectOption
      key={`activation-key-${idx}`}
      width="100%"
      value={key}
      isDisabled={key.isDisabled}
    >
      {key.name}
    </SelectOption>
  ));
};

const FirstStep = ({
  createdKeyName,
  handleFetchKeys,
  keys,
  selectedKey,
  setIsModalOpen,
  setSelectedKey,
  setStep,
  step,
}) => {
  const [isOpen, setOpen] = useState(false);
  const axios = useAxiosWithPlatformInterceptors();
  const addNotification = useAddNotification();
  const { data: permissions, isLoading: permissionsLoading } =
    useActivationKeyPermissions();

  const hasReadPermission = permissions?.canReadActivationKeys;
  const hasWritePermission = permissions?.canWriteActivationKeys;

  const handleActivationKeySelect = (selectedKeyDetails) => {
    setSelectedKey(selectedKeyDetails);
    step === 0 && setStep(1);
    setOpen(false);
  };

  useEffect(() => {
    if (createdKeyName) {
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].name === createdKeyName) {
          handleActivationKeySelect(keys[i]);
        }
      }
    }
  }, [createdKeyName]);

  const handleOpenDropdown = async () => {
    setOpen(!isOpen);
    // Only fetch keys if we have read permission and not currently loading permissions
    if (!isOpen && !permissionsLoading && hasReadPermission) {
      const error = await handleFetchKeys();

      if (error) {
        setOpen(false);
      }
    }
  };

  const handleCreateActivationKey = () => {
    setIsModalOpen(true);
    setOpen(false);
  };

  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => handleOpenDropdown()}
      isExpanded={isOpen}
      style={{
        minWidth: '300px',
        marginTop: '8px',
        marginBottom: '8px',
      }}
    >
      {selectedKey.name || selectedKey}
    </MenuToggle>
  );

  const autoGenerateKey = async () => {
    const activationKeyName = uuidv4();

    const postResponse = await createActivationKey(axios, {
      name: activationKeyName,
      role: '',
      serviceLevel: '',
      usage: '',
    });

    if (postResponse.body?.id) {
      dispatchNotification(
        {
          variant: 'success',
          title: 'Activation key created successfully',
          description: `${postResponse.body.name} is now available for use.`,
        },
        addNotification,
      );

      handleActivationKeySelect(postResponse.body);
    } else if (postResponse.error) {
      dispatchNotification(
        {
          variant: 'danger',
          title: 'Error',
          description: postResponse.error.message,
          dismissable: true,
          autoDismiss: false,
        },
        addNotification,
      );

      setOpen(false);
    }
  };

  return (
    <React.Fragment>
      <Content>
        <Content component={ContentVariants.p}>
          You need an{' '}
          <Content
            component={ContentVariants.a}
            href="https://docs.redhat.com/en/documentation/subscription_central/1-latest/html/getting_started_with_activation_keys_on_the_hybrid_cloud_console/index"
            rel="noopener noreferrer"
            target="_blank"
          >
            activation key
            <Icon className="pf-v6-u-ml-xs">
              <ExternalLinkAltIcon color="var(--pf-t--global--text--color--link--default)" />
            </Icon>
          </Content>{' '}
          to register. An activation key is a pre-shared token that enables
          authorized users to register and auto-configure systems.
        </Content>
      </Content>
      <div
        style={{
          fontWeight: 'var(--pf-t--global--font--weight--heading--bold)',
          marginTop: '16px',
        }}
        data-testid="select-activation-key"
      >
        Activation key <span style={{ color: '#C9190B' }}>*</span>
      </div>
      <Select
        isOpen={isOpen}
        onSelect={(_, optionName) => handleActivationKeySelect(optionName)}
        selected={selectedKey}
        toggle={toggle}
      >
        <SelectList
          style={{
            maxHeight: '300px',
            overflowY: 'scroll',
            ...(!hasReadPermission &&
              !permissionsLoading && {
                minWidth: '500px',
              }),
          }}
        >
          {!hasReadPermission && !permissionsLoading ? (
            <li
              role="presentation"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '32px 48px',
                textAlign: 'center',
                listStyle: 'none',
                width: '500px',
              }}
            >
              <LockIcon
                size="xl"
                style={{
                  fontSize: '64px',
                  color: 'var(--pf-t--global--icon--color--subtle)',
                  marginBottom: '16px',
                }}
              />
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--heading--md)',
                  fontWeight:
                    'var(--pf-t--global--font--weight--heading--default)',
                  marginBottom: '8px',
                  color: 'var(--pf-t--global--text--color--regular)',
                }}
              >
                You do not have access to view activation keys
              </div>
              <div
                style={{
                  fontSize: 'var(--pf-t--global--font--size--body--default)',
                  color: 'var(--pf-t--global--text--color--subtle)',
                  lineHeight: '1.5',
                }}
              >
                To select an activation key, you must be granted a minimum of
                activation key permissions from your Organization Administrator.
              </div>
            </li>
          ) : keys === undefined || permissionsLoading ? (
            <ActivationKeysList keys={loadingActivationKeys} />
          ) : (
            <ActivationKeysList keys={keys} />
          )}
        </SelectList>
        {(hasReadPermission || !permissionsLoading) &&
          !(!hasReadPermission && !permissionsLoading) && (
            <MenuFooter>
              <Button
                variant="link"
                icon={<PlusCircleIcon />}
                isInline
                onClick={() => handleCreateActivationKey()}
                isDisabled={!hasWritePermission || permissionsLoading}
              >
                Create activation key
              </Button>
              <br />
              <Button
                className="pf-v6-u-pt-sm"
                variant="link"
                icon={<SyncAltIcon />}
                isInline
                onClick={() => autoGenerateKey()}
                isDisabled={!hasWritePermission || permissionsLoading}
              >
                Auto-generate activation key
              </Button>
            </MenuFooter>
          )}
      </Select>
      <Content>
        <Content component={ContentVariants.p}>
          You can manage activation keys on the{' '}
          <InsightsLink to="/activation-keys" app="connector">
            Activation keys page.
          </InsightsLink>
        </Content>
      </Content>
      {selectedKey.id && (
        <ShowSelectedActivationKey selectedKey={selectedKey} />
      )}
    </React.Fragment>
  );
};

FirstStep.propTypes = {
  createdKeyName: PropTypes.string,
  handleFetchKeys: PropTypes.func,
  keys: PropTypes.array,
  selectedKey: PropTypes.object,
  setIsModalOpen: PropTypes.func,
  setSelectedKey: PropTypes.func,
  setStep: PropTypes.func,
  step: PropTypes.number,
};

export default FirstStep;
