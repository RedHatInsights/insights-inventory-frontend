import React from 'react';
import { TextInput } from '@patternfly/react-core';

export interface TextFilterProps {
  value?: string;
  onChange?: (event: React.FormEvent<HTMLInputElement>, value: string) => void;
  placeholder?: string;
}

export const TextFilter = ({
  value,
  onChange,
  placeholder,
}: TextFilterProps) => (
  <TextInput
    type="text"
    value={value || ''}
    onChange={onChange}
    placeholder={placeholder}
    aria-label={placeholder}
  />
);

export default TextFilter;
