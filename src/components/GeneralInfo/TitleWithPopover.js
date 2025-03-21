import React from 'react';
import PropTypes from 'prop-types';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { Button, Popover } from '@patternfly/react-core';

const TitleWithPopover = ({ title, content, headerContent }) => (
  <React.Fragment>
    <span>{title}</span>
    <Popover
      headerContent={<div>{headerContent || title}</div>}
      bodyContent={<div>{content}</div>}
    >
      <Button
        variant="plain"
        aria-label={`Action for ${title}`}
        className="ins-active-general_information__popover-icon"
      >
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  </React.Fragment>
);

TitleWithPopover.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  headerContent: PropTypes.string,
};

export default TitleWithPopover;
