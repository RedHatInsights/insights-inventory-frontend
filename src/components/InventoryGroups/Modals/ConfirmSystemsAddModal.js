import React from 'react';
import PropTypes from 'prop-types';
import { FormSpy, useFormApi } from '@data-driven-forms/react-form-renderer';
import { Button, Flex, Icon } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens';

import Modal from './Modal';
import { confirmSystemsAddSchema } from './ModalSchemas/schemes';
import useWorkspaceFeatureFlag from '../../../Utilities/hooks/useWorkspaceFeatureFlag';

const ConfirmSystemsAddModal = ({
  isModalOpen,
  onSubmit,
  onBack,
  onCancel,
  hostsNumber,
}) => {
  const { handleSubmit, getState } = useFormApi();
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  return (
    <Modal
      isModalOpen={isModalOpen}
      title={`Add all selected systems to ${
        isWorkspaceEnabled ? 'workspace' : 'group'
      }?`}
      titleIconVariant={() => (
        <Icon color={warningColor.value}>
          <ExclamationTriangleIcon />
        </Icon>
      )}
      closeModal={onCancel}
      schema={confirmSystemsAddSchema(hostsNumber, isWorkspaceEnabled)}
      reloadData={() => {}}
      onSubmit={onSubmit}
      customFormTemplate={({ formFields, schema }) => {
        const { submitting, valid } = getState();

        return (
          <form onSubmit={handleSubmit}>
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsLg' }}
            >
              {schema.title}
              {formFields}
              <FormSpy>
                {() => (
                  <Flex>
                    <Button
                      isDisabled={submitting || !valid}
                      type="submit"
                      color="primary"
                      variant="primary"
                    >
                      {`Yes, add all systems to ${
                        isWorkspaceEnabled ? 'workspace' : 'group'
                      }`}
                    </Button>
                    <Button variant="secondary" onClick={onBack}>
                      Back
                    </Button>
                    <Button variant="link" onClick={onCancel}>
                      Cancel
                    </Button>
                  </Flex>
                )}
              </FormSpy>
            </Flex>
          </form>
        );
      }}
    />
  );
};

ConfirmSystemsAddModal.propTypes = {
  isModalOpen: PropTypes.bool,
  onSubmit: PropTypes.func,
  onBack: PropTypes.func,
  onCancel: PropTypes.func,
  hostsNumber: PropTypes.number,
};

export default ConfirmSystemsAddModal;
