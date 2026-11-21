import React, { Ref } from 'react';
import {
  Button,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

export interface TypeaheadMenuToggleProps {
  toggleRef: Ref<MenuToggleElement>;
  isExpanded: boolean;
  onToggleClick: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  inputId?: string;
  inputAriaLabel?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  /** Clears the text and selection. Shown only while the input has a value. */
  onClear?: () => void;
  'data-testid'?: string;
}

export const TypeaheadMenuToggle = ({
  toggleRef,
  isExpanded,
  onToggleClick,
  searchValue,
  onSearchChange,
  placeholder,
  inputId,
  inputAriaLabel,
  inputRef,
  onClear,
  'data-testid': dataTestId,
}: TypeaheadMenuToggleProps) => (
  <MenuToggle
    variant="typeahead"
    onClick={onToggleClick}
    innerRef={toggleRef}
    isExpanded={isExpanded}
    data-testid={dataTestId}
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
        aria-label={inputAriaLabel}
        autoComplete="off"
        placeholder={placeholder}
      />
      {onClear && searchValue && (
        <TextInputGroupUtilities>
          <Button
            variant="plain"
            icon={<TimesIcon />}
            aria-label="Clear input value"
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
          />
        </TextInputGroupUtilities>
      )}
    </TextInputGroup>
  </MenuToggle>
);
