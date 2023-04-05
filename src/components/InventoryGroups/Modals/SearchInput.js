import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    HelperText,
    HelperTextItem,
    Select,
    SelectOption
} from '@patternfly/react-core';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';
import useFieldApi from '@data-driven-forms/react-form-renderer/use-field-api';

const SearchInput = (props) => {
    useFieldApi(props);
    const { change } = useFormApi();
    const [isLoading, setIsLoading] = useState(true);
    //fetch data from the store
    const storeGroups = useSelector(({ groups }) => groups?.data?.results);

    //select options is a constructed array of objects with values for dropdown
    const [selectOptions, setSelectOptions] = useState([]);
    //when storeGroups is changed - we create selectOptions
    useEffect(() => {
        setSelectOptions(
            (storeGroups || []).reduce((acc, group) => {
                acc.push({
                    DeviceGroup: {
                        ID: group.id,
                        Name: group.name,
                        UpdatedAt: group.updated_at,
                        CreatedAt: group.created_at
                    }
                });
                return acc;
            }, [])
        );
        setIsLoading(false);
    }, [storeGroups]);

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(null);

    const [searchTerm, setSearchTerm] = useState();

    const onToggle = (isOpen) => {
        setIsOpen(isOpen);
    };

    const updateSelection = (value) => {
        // Update state when an option has been selected.
        setSelected(value);
        setIsOpen(false);
        //this is requried to make select component pass the saved data up to the modal
        const found = storeGroups.some(el => el.name === value.name);
        if (found || searchTerm === '') {
            change('group', value);
        }
    };

    const clearSelection = () => {
        setSearchTerm('');
        updateSelection(null);
        setIsOpen(false);
    };

    const onSelect = (_event, selection, isPlaceholder) => {
        if (isPlaceholder) {
            clearSelection();
        }
        else {
            updateSelection(selection);
        }
    };

    return (
        <>
            <HelperText>
                {!isLoading && !selected && isOpen && selectOptions.length ? (
                    <HelperTextItem variant="warning" className="pf-u-font-weight-bold">
            Over {selectOptions.length} results found. Refine your search.
                    </HelperTextItem>
                ) : (
                    <HelperTextItem className="pf-u-font-weight-bold">
            Select a group
                    </HelperTextItem>
                )}
            </HelperText>
            <Select
                variant="typeahead"
                typeAheadAriaLabel="Select a group"
                onToggle={onToggle}
                onSelect={onSelect}
                onClear={clearSelection}
                selections={selected ? selected : searchTerm}
                isOpen={isOpen}
                aria-labelledby="typeahead-select-id-1"
                placeholderText="Type or click to select a group"
                noResultsFoundText={isLoading ? 'Loading...' : 'No results found'}
                isInputValuePersisted={true}
                maxHeight={'180px'}
            >
                {selectOptions.length === 0
                    ? []
                    : selectOptions.map(({ DeviceGroup }) => (
                        <SelectOption
                            key={DeviceGroup.ID}
                            value={{
                                toString: () => DeviceGroup.Name,
                                groupId: DeviceGroup.ID,
                                name: DeviceGroup.Name
                            }}
                            {...(DeviceGroup.description && {
                                description: DeviceGroup.description
                            })}
                        />
                    ))}
            </Select>
        </>
    );
};

export default SearchInput;
