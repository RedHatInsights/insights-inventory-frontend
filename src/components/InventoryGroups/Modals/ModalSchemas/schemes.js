import React from 'react';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { nameValidator } from '../../helpers/validate';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Text,
  TextInput,
} from '@patternfly/react-core';
import awesomeDebouncePromise from 'awesome-debounce-promise';
import { getWritableGroups } from '../../utils/api';
import { useFieldApi } from '@data-driven-forms/react-form-renderer';
import { showError } from '@data-driven-forms/pf4-component-mapper';

export const createGroupSchema = (namePresenceValidator) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      label: 'Workspace name',
      helperText:
        'Can only contain letters, numbers, spaces, hyphens ( - ), and underscores ( _ ).',
      isRequired: true,
      autoFocus: true,
      validate: [
        // async validator has to be first in the list
        namePresenceValidator,
        { type: validatorTypes.REQUIRED },
        { type: validatorTypes.MAX_LENGTH, threshold: 50 },
        nameValidator,
      ],
    },
  ],
});

export const confirmSystemsAddSchema = (hostsNumber) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'warning-message',
      label: `${hostsNumber} of the systems you selected already belong to a workspace.
        Moving them to a different workspace will impact their configuration.`,
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'confirmation',
      label: 'I acknowledge that this action cannot be undone.',
      validate: [{ type: validatorTypes.REQUIRED }],
    },
  ],
});

export const CreateWorkspaceTextField = (props) => {
  const fieldData = useFieldApi(props);

  const { validated } = fieldData.meta.validating
    ? { validated: 'indeterminate' }
    : showError(fieldData?.meta, fieldData.validateOnMount);

  const validationInternal =
    (fieldData.meta.touched || fieldData.validateOnMount) &&
    (fieldData.meta.error ||
      fieldData.meta.submitError ||
      fieldData.meta.warning);
  return (
    <FormGroup
      label={fieldData?.label}
      isRequired={fieldData?.isRequired}
      fieldId={fieldData.id || fieldData.input.name}
    >
      <TextInput
        {...fieldData?.input}
        isRequired={fieldData?.isRequired}
        validated={validated}
        id={fieldData.id || fieldData.input.name}
      />
      {(fieldData?.helperText || ['error', 'warning'].includes(validated)) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant={validated} hasIcon>
              {validationInternal || fieldData?.helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

const createDescription = (hosts) => {
  return (
    <Text>
      Select a workspace to add{' '}
      <strong>
        {hosts.length > 1 ? `${hosts.length} systems` : hosts[0].display_name}
      </strong>{' '}
      to, or create a new one.
    </Text>
  );
};

//this is a custom schema that is passed via additional mappers to the Modal component
//it allows to create custom item types in the modal

const loadOptions = awesomeDebouncePromise(
  async (searchValue, chrome, isKesselEnabled = false) => {
    const fetchedGroups = await getWritableGroups(
      searchValue,
      { page: 1, per_page: 100 }, // TODO: make the list paginated
      () => chrome.getUserPermissions('inventory'),
      isKesselEnabled,
    );

    return fetchedGroups.map(({ name, id }) => ({
      label: name,
      value: JSON.stringify({ id, name }), // stringify is a workaround for https://github.com/data-driven-forms/react-forms/issues/1401
    }));
  },
  250,
  { onlyResolvesLast: false },
);

export const addHostSchema = (hosts, chrome, isKesselEnabled = false) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'description',
      label: createDescription(hosts),
    },
    {
      component: 'select',
      name: 'group',
      label: 'Select a workspace',
      simpleValue: true,
      isSearchable: true, // enables typeahead
      isRequired: true,
      isClearable: true,
      placeholder: 'Type or click to select a workspace',
      loadOptions: (searchValue) =>
        loadOptions(searchValue, chrome, isKesselEnabled),
      options: [],
      validate: [{ type: validatorTypes.REQUIRED }],
      updatingMessage: 'Loading workspaces...',
      loadingMessage: 'Loading workspaces...',
    },
    {
      component: 'create-group-btn',
      name: 'create-group-btn',
      isRequired: true,
    },
  ],
});
