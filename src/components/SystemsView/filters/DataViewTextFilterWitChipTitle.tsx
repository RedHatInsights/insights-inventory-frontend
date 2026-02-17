import React, { FC } from 'react';
import {
  DataViewTextFilter,
  DataViewTextFilterProps,
} from '@patternfly/react-data-view';

export interface DataViewTextFilterWitChipTitleProps
  extends DataViewTextFilterProps {
  chipTitle?: string;
}

export const DataViewTextFilterWitChipTitle: FC<
  DataViewTextFilterWitChipTitleProps
> = ({ chipTitle, title, ...props }) => {
  return <DataViewTextFilter title={chipTitle || title} {...props} />;
};

export default DataViewTextFilterWitChipTitle;
