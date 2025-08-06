import React from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';

const Workspace = ({ groups }) =>
  isEmpty(groups) ? (
    <div className="pf-v5-u-disabled-color-200">No workspace</div>
  ) : (
    groups[0].name
  );

Workspace.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
    }).isRequired,
  ),
};
export default Workspace;
