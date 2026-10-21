import React from 'react';
import { Tooltip } from '@patternfly/react-core';

interface NoAccessTooltipWrapProps {
  isEnabled: boolean;
  tooltipContent: React.ReactNode;
  children: React.ReactElement;
  wrapTriggerInSpan?: boolean;
  triggerSpanProps?: React.HTMLAttributes<HTMLSpanElement>;
}

/**
 * When `isEnabled` is false, wraps children in a Tooltip explaining missing access.
 * When true, returns children unchanged.
 *
 * Use `wrapTriggerInSpan` for controls that need an inline wrapper so the tooltip
 * can receive hover events (e.g. MenuToggle styled as disabled, or native-disabled buttons).
 */
const NoAccessTooltipWrap = ({
  isEnabled,
  tooltipContent,
  children,
  wrapTriggerInSpan = false,
  triggerSpanProps = {},
}: NoAccessTooltipWrapProps) => {
  if (isEnabled) {
    return children;
  }

  const trigger = wrapTriggerInSpan ? (
    <span {...triggerSpanProps}>{children}</span>
  ) : (
    children
  );

  return <Tooltip content={tooltipContent}>{trigger}</Tooltip>;
};

export default NoAccessTooltipWrap;
