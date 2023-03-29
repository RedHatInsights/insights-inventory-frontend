import React from 'react';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { nameValidator } from '../../helpers/validate';
import { Text } from '@patternfly/react-core';

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

const createDescription = (systemName) => {
    return (
        <Text>
        Select a group to add <strong>{systemName}</strong> to, or create a new one.
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
            component: 'search-input',
            name: 'group',
            label: 'Select a group',
            isRequired: true,
            validate: [{ type: validatorTypes.REQUIRED }]
        },
        { component: 'create-group-btn', name: 'create-group-btn' }
    ]
});
