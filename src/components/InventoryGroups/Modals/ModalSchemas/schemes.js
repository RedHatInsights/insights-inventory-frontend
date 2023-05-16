import React from 'react';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { nameValidator } from '../../helpers/validate';
import { Text } from '@patternfly/react-core';
import { getGroups } from '../../utils/api';
import awesomeDebouncePromise from 'awesome-debounce-promise';

export const createGroupSchema = (namePresenceValidator) => ({
    fields: [
        {
            component: componentTypes.TEXT_FIELD,
            name: 'name',
            label: 'Group name',
            helperText:
        'Can only contain letters, numbers, spaces, hyphens ( - ), and underscores( _ ).',
            isRequired: true,
            autoFocus: true,
            validate: [
                // async validator has to be first in the list
                namePresenceValidator,
                { type: validatorTypes.REQUIRED },
                { type: validatorTypes.MAX_LENGTH, threshold: 50 },
                nameValidator
            ]
        }
    ]
});

export const confirmSystemsAddSchema = (hostsNumber) => ({
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'warning-message',
            label: `${hostsNumber} of the systems you selected already belong to a group.
             Moving them to a different group will impact their configuration.`
        },
        {
            component: componentTypes.CHECKBOX,
            name: 'confirmation',
            label: 'I acknowledge that this action cannot be undone.',
            validate: [{ type: validatorTypes.REQUIRED }]
        }
    ]
});

const createDescription = (systemName) => {
    return (
        <Text>
      Select a group to add <strong>{systemName}</strong> to, or create a new
      one.
        </Text>
    );
};

//this is a custom schema that is passed via additional mappers to the Modal component
//it allows to create custom item types in the modal

export const addHostSchema = (systemName) => ({
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'description',
            label: createDescription(systemName)
        },
        {
            component: 'select',
            name: 'group',
            label: 'Select a group',
            simpleValue: true,
            isSearchable: true, // enables typeahead
            isRequired: true,
            isClearable: true,
            placeholder: 'Type or click to select a group',
            loadOptions: async (searchValue = '') => {
                // add a slight delay for scenarios when a new group has been just created
                const data = await awesomeDebouncePromise(() => getGroups({ name: searchValue }, {}), 500)();
                return (data?.results || []).reduce((acc, { name, id }) => {
                    if (name.toLowerCase().includes(searchValue.trim().toLowerCase())) {
                        return [
                            ...acc,
                            {
                                label: name,
                                value: { name, id }
                            }
                        ];
                    }
                }, []);
            },
            validate: [{ type: validatorTypes.REQUIRED }]
        },
        {
            component: 'create-group-btn',
            name: 'create-group-btn',
            isRequired: true
        }
    ]
});
