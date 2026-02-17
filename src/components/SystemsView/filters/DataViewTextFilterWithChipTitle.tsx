import React, { FC } from 'react';
import {
  DataViewTextFilter,
  DataViewTextFilterProps,
} from '@patternfly/react-data-view';

export interface DataViewTextFilterWithChipTitleProps
  extends DataViewTextFilterProps {
  chipTitle?: string;
}

export const DataViewTextFilterWithChipTitle: FC<
  DataViewTextFilterWithChipTitleProps
> = ({ chipTitle, title, ...props }) => {
  return <DataViewTextFilter title={chipTitle || title} {...props} />;
};

export default DataViewTextFilterWithChipTitle;
