import React from 'react';
import PropTypes from 'prop-types';
import { Label, Split, SplitItem, Tooltip } from '@patternfly/react-core';
import { statusMapper } from './statusMapper';

const Status = ({
  id,
  type,
  isLabel = false,
  toolTipContent = '',
  className = '',
  isLink,
}) => {
  const { text, Icon, color, labelColor } =
    Object.prototype.hasOwnProperty.call(statusMapper, type)
      ? statusMapper[type]
      : statusMapper['default'];

  return (
    <>
      {isLabel ? (
        <Label id={id} color={labelColor} icon={<Icon />} className={className}>
          {text}
        </Label>
      ) : (
        <Split id={id} style={{ color }} className={className}>
          <SplitItem className="pf-v5-u-mr-sm">
            {toolTipContent ? (
              <Tooltip content="blargh">
                <Icon />
              </Tooltip>
            ) : (
              <Icon />
            )}
          </SplitItem>
          <SplitItem>
            <p
              style={
                isLink
                  ? {
                      textDecoration: ' grey dotted underline',
                      cursor: 'pointer',
                    }
                  : {}
              }
            >
              {text}
            </p>
          </SplitItem>
        </Split>
      )}
    </>
  );
};

export default Status;

Status.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  isLabel: PropTypes.bool,
  toolTipContent: PropTypes.string,
  className: PropTypes.string,
  isLink: PropTypes.bool,
};

Status.defaultProps = {
  id: 'status',
};
