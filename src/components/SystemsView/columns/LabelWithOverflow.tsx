import React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';
import CellValue from './CellValue';

interface LabelWithOverflowProps {
  items: string[];
  notAvailableReason: string;
  'aria-label': string;
  numLabels?: number;
}

const LabelWithOverflow = ({
  items,
  notAvailableReason,
  'aria-label': ariaLabel,
  numLabels = 1,
}: LabelWithOverflowProps) => {
  if (items.length === 0) {
    return <CellValue type="notAvailable" reason={notAvailableReason} />;
  }

  return (
    <CellValue
      type="present"
      value={
        <LabelGroup numLabels={numLabels} isCompact aria-label={ariaLabel}>
          {items.map((item) => (
            <Label key={item} isCompact>
              {item}
            </Label>
          ))}
        </LabelGroup>
      }
    />
  );
};

export default LabelWithOverflow;
