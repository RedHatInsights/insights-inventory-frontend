import React from 'react';
import LabelWithOverflow from '../../LabelWithOverflow';

const TAG_VALUE_NOT_AVAILABLE = 'This system does not have this tag';

interface TagKeyValuesProps {
  identity: string;
  values: string[];
}

export const TagKeyValues = ({ identity, values }: TagKeyValuesProps) => (
  <LabelWithOverflow
    items={values}
    notAvailableReason={TAG_VALUE_NOT_AVAILABLE}
    aria-label={identity}
    numLabels={3}
  />
);

export default TagKeyValues;
