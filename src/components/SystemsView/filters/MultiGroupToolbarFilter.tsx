import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Label,
  LabelGroup,
  ToolbarContentContext,
  ToolbarContext,
  ToolbarFilterProps,
  ToolbarItem,
  ToolbarLabel,
  ToolbarLabelGroup,
} from '@patternfly/react-core';
import ReactDOM from 'react-dom';

export interface MultiGroupToolbarFilterProps
  extends Omit<ToolbarFilterProps, 'labels'> {
  groupLabels: {
    category: string | ToolbarLabelGroup;
    labels: (string | ToolbarLabel)[];
  }[];
}

export const MultiGroupToolbarFilter = ({
  groupLabels,
  children,
  isExpanded,
  showToolbarItem,
  expandableLabelContainerRef,
  deleteLabel = () => {},
  deleteLabelGroup,
  labelGroupCollapsedText,
  labelGroupExpandedText,
  categoryName,
  ...props
}: MultiGroupToolbarFilterProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const {
    isExpanded: managedIsExpanded,
    labelGroupContentRef,
    updateNumberFilters,
  } = useContext(ToolbarContext);
  const _isExpanded = isExpanded !== undefined ? isExpanded : managedIsExpanded;

  const getCategory = (category: string | ToolbarLabelGroup) => {
    return typeof category !== 'string' && category.hasOwnProperty('key')
      ? category.key
      : category.toString();
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const categoryKey = getCategory(categoryName);
    updateNumberFilters(categoryKey, groupLabels.length);
  }, [groupLabels, categoryName, updateNumberFilters]);

  const { labelContainerRef } = useContext(ToolbarContentContext);

  const groupLabelsRendered =
    groupLabels?.map((group) => {
      const category = getCategory(group.category);
      return (
        <ToolbarItem key={category} variant="label-group">
          <LabelGroup
            key={category}
            categoryName={category}
            isClosable={deleteLabelGroup !== undefined}
            onClick={() =>
              deleteLabelGroup ? deleteLabelGroup(category) : null
            }
            collapsedText={labelGroupCollapsedText}
            expandedText={labelGroupExpandedText}
          >
            {group.labels.map((label) =>
              typeof label === 'string' ? (
                <Label key={label} onClose={() => deleteLabel(category, label)}>
                  {label}
                </Label>
              ) : (
                <Label
                  key={label.key}
                  onClose={() => deleteLabel(category, label)}
                >
                  {label.node}
                </Label>
              ),
            )}
          </LabelGroup>
        </ToolbarItem>
      );
    }) || null;

  if (!_isExpanded && isMounted) {
    return (
      <>
        {showToolbarItem && <ToolbarItem {...props}>{children}</ToolbarItem>}
        {labelGroupContentRef?.current?.firstElementChild &&
          ReactDOM.createPortal(
            groupLabelsRendered,
            labelGroupContentRef.current.firstElementChild,
          )}
      </>
    );
  }

  return (
    <>
      {showToolbarItem && <ToolbarItem {...props}>{children}</ToolbarItem>}
      {labelContainerRef.current &&
        ReactDOM.createPortal(groupLabelsRendered, labelContainerRef.current)}
      {expandableLabelContainerRef &&
        expandableLabelContainerRef.current &&
        ReactDOM.createPortal(
          groupLabelsRendered,
          expandableLabelContainerRef.current,
        )}
    </>
  );
};

export default MultiGroupToolbarFilter;
