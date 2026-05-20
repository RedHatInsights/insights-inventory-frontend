import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@patternfly/react-core';

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
  wrapTriggerInSpan,
  triggerSpanProps,
}) => {
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

NoAccessTooltipWrap.propTypes = {
  isEnabled: PropTypes.bool.isRequired,
  tooltipContent: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  wrapTriggerInSpan: PropTypes.bool,
  triggerSpanProps: PropTypes.object,
};

NoAccessTooltipWrap.defaultProps = {
  wrapTriggerInSpan: false,
  triggerSpanProps: {},
};

export default NoAccessTooltipWrap;
