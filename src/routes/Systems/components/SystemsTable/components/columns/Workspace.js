import React from 'react';
import isEmpty from 'lodash/isEmpty';

const Workspace = ({ groups }) =>
  isEmpty(groups) ? (
    <div className="pf-v5-u-disabled-color-200">No workspace</div>
  ) : (
    groups[0].name
  );

export default Workspace;
