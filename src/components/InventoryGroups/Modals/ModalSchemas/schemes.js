import React from 'react';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { nameValidator } from '../../helpers/validate';
import { Text } from '@patternfly/react-core';
import awesomeDebouncePromise from 'awesome-debounce-promise';
import { getWritableGroups } from '../../utils/api';

export const createGroupSchema = (
  namePresenceValidator,
  isWorkspaceEnabled
) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      label: isWorkspaceEnabled ? 'Workspace name' : 'Group name',
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

export const confirmSystemsAddSchema = (hostsNumber, isWorkspaceEnabled) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'warning-message',
      label: `${hostsNumber} of the systems you selected already belong to a ${
        isWorkspaceEnabled ? 'workspace' : 'group'
      }.
             Moving them to a different ${
               isWorkspaceEnabled ? 'workspace' : 'group'
             } will impact their configuration.`,
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'confirmation',
      label: 'I acknowledge that this action cannot be undone.',
      validate: [{ type: validatorTypes.REQUIRED }],
    },
  ],
});

const createDescription = (hosts, isWorkspaceEnabled) => {
  return (
    <Text>
      {`Select a ${isWorkspaceEnabled ? 'workspace' : 'group'} to add`}{' '}
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
  async (searchValue, chrome) => {
    const fetchedGroups = await getWritableGroups(
      searchValue,
      { page: 1, per_page: 100 }, // TODO: make the list paginated
      () => chrome.getUserPermissions('inventory')
    );

    return fetchedGroups.map(({ name, id }) => ({
      label: name,
      value: JSON.stringify({ id, name }), // stringify is a workaround for https://github.com/data-driven-forms/react-forms/issues/1401
    }));
  },
  250,
  { onlyResolvesLast: false }
);

export const addHostSchema = (hosts, chrome, isWorkspaceEnabled) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'description',
      label: createDescription(hosts, isWorkspaceEnabled),
    },
    {
      component: 'select',
      name: isWorkspaceEnabled ? 'workspace' : 'group',
      label: isWorkspaceEnabled ? 'Select a workspace' : 'Select a group',
      simpleValue: true,
      isSearchable: true, // enables typeahead
      isRequired: true,
      isClearable: true,
      placeholder: isWorkspaceEnabled
        ? 'Type or click to select a workspace'
        : 'Type or click to select a group',
      loadOptions: (searchValue) => loadOptions(searchValue, chrome),
      options: [],
      validate: [{ type: validatorTypes.REQUIRED }],
      updatingMessage: isWorkspaceEnabled
        ? 'Loading workspaces...'
        : 'Loading groups...',
      loadingMessage: isWorkspaceEnabled
        ? 'Loading workspaces...'
        : 'Loading groups...',
    },
    {
      component: 'create-group-btn',
      name: 'create-group-btn',
      isRequired: true,
    },
  ],
});
