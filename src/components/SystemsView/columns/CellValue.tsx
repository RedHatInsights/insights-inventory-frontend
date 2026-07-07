import React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { DISABLED_TEXT_COLOR } from '../../../constants';

export const NOT_APPLICABLE = 'N/A';
export const NOT_AVAILABLE = '--';

/** Cell has a value to display. */
type PresentCellValueProps = {
  type: 'present';
  /** Content to render in the cell. */
  value: React.ReactNode;
};

/** Field value is not set for this system. */
type NotSetCellValueProps = {
  type: 'notSet';
  /** Visible placeholder No __ */
  value: string;
};

/** Column applies, but data is missing for this system. */
type NotAvailableCellValueProps = {
  type: 'notAvailable';
  /** Explains why data is missing. Shown in tooltip and screen reader label. */
  reason: string;
  /** Optional visible placeholder. */
  value?: string;
};

/** Column does not apply to this system. */
type NotApplicableCellValueProps = {
  type: 'notApplicable';
  /** Explains why the column does not apply. Shown in tooltip and screen reader label. */
  reason: string;
};

type CellValueProps =
  | PresentCellValueProps
  | NotSetCellValueProps
  | NotAvailableCellValueProps
  | NotApplicableCellValueProps;

const notApplicableLabel = (reason: string) => `Not applicable. ${reason}`;
const notAvailableLabel = (reason: string, value?: string) =>
  `${value ?? 'Not available'}. ${reason}`;

const CellValue = (props: CellValueProps) => {
  switch (props.type) {
    case 'present':
      return <span>{props.value}</span>;

    case 'notSet':
      return <span style={{ color: DISABLED_TEXT_COLOR }}>{props.value}</span>;

    case 'notAvailable':
      return (
        <Tooltip content={props.reason}>
          <span
            aria-label={notAvailableLabel(props.reason, props.value)}
            style={{ color: DISABLED_TEXT_COLOR }}
          >
            {props.value ?? NOT_AVAILABLE}
          </span>
        </Tooltip>
      );

    case 'notApplicable':
      return (
        <Tooltip content={props.reason}>
          <span
            aria-label={notApplicableLabel(props.reason)}
            style={{ color: DISABLED_TEXT_COLOR }}
          >
            {NOT_APPLICABLE}
          </span>
        </Tooltip>
      );
  }
};

export default CellValue;
