import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
    HelperText,
    HelperTextItem,
    Select,
    SelectOption
} from '@patternfly/react-core';
import debounce from 'lodash/debounce';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';

const SearchInput = () => {
    const { change } = useFormApi();
    const [storeGroups, setStoreGroups] = useState();
    const [isLoading, setIsLoading] = useState(true);
    //fetch data from the store
    const fetchedGroupValues = useSelector(({ groups }) => groups?.data?.results);
    //as soon data is fetched assign it to the storeGroups
    useEffect(() => {
        setStoreGroups(fetchedGroupValues);
    }, [fetchedGroupValues]);
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
    const [searchTerm, setSearchTerm] = useState('');

    const onToggle = (isOpen) => {
        setIsOpen(isOpen);
    };

    const updateSelection = (value) => {
    // Update state when an option has been selected.
        setSelected(value);
        setIsOpen(false);
        //this is requried to make select component pass the saved data up to the modal
        change('group', value);
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

    const onFilter = useCallback(debounce((_event, value) => {
        // Only filter the groups data if there is a search term
        if (value) {
            const filteredGroups = fetchedGroupValues.filter(group =>
                group.name.toLowerCase().includes(value.toLowerCase())
            );
            // Update the state with the filtered groups data
            setStoreGroups(filteredGroups);
        } else {
            // If the search term is empty, use the original groups data from the store
            setStoreGroups(fetchedGroupValues);
        }

        // Update the search term state
        setSearchTerm(value);
    }, 100), []);

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
                onFilter={(_event, value) => onFilter(_event, value)}
                aria-labelledby="typeahead-select-id-1"
                placeholderText="Type or click to select a group"
                isInputValuePersisted={true}
                maxHeight={'180px'}
            >
                {selectOptions.length === 0
                    ? []
                    : selectOptions?.map(({ DeviceGroup }) => (
                        <SelectOption
                            key={DeviceGroup.ID}
                            value={{
                                toString: () => DeviceGroup.Name,
                                groupId: DeviceGroup.ID
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
