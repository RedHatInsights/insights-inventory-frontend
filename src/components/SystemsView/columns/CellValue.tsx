import React from 'react';
import { NOT_AVAILABLE } from '../../../constants';

interface CellValueProps {
  value?: React.ReactNode;
  fallback?: string;
}

const CellValue = ({ value, fallback = NOT_AVAILABLE }: CellValueProps) => {
  const isValueMissing = value === undefined;
  const isValueEmpty = value === null || value === '' || value === 0;

  if (isValueMissing) {
    return (
      <span style={{ color: 'var(--pf-t--global--text--color--disabled)' }}>
        {NOT_AVAILABLE}
      </span>
    );
  }

  return (
    <span
      style={
        isValueEmpty
          ? { color: 'var(--pf-t--global--text--color--disabled)' }
          : undefined
      }
    >
      {isValueEmpty ? fallback : value}
    </span>
  );
};

export default CellValue;
