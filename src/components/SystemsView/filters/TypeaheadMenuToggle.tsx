import React, { Ref } from 'react';
import {
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';

export interface TypeaheadMenuToggleProps {
  toggleRef: Ref<MenuToggleElement>;
  isExpanded: boolean;
  onToggleClick: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  inputId?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export const TypeaheadMenuToggle = ({
  toggleRef,
  isExpanded,
  onToggleClick,
  searchValue,
  onSearchChange,
  placeholder,
  inputId,
  inputRef,
}: TypeaheadMenuToggleProps) => (
  <MenuToggle
    variant="typeahead"
    onClick={onToggleClick}
    innerRef={toggleRef}
    isExpanded={isExpanded}
  >
    <TextInputGroup isPlain>
      <TextInputGroupMain
        ref={inputRef}
        value={searchValue}
        onClick={(e) => {
          e.stopPropagation();
          if (!isExpanded) {
            onToggleClick();
          }
        }}
        onChange={(_event, val) => onSearchChange(val)}
        onFocus={() => {
          if (!isExpanded) {
            onToggleClick();
          }
        }}
        id={inputId}
        autoComplete="off"
        placeholder={placeholder}
      />
    </TextInputGroup>
  </MenuToggle>
);
