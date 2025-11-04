import React from 'react';
import PropTypes from 'prop-types';
import Overview from './Overview';

const OverviewTab = ({ entity, ...props }) => {
  if (!entity) {
    console.error('OverviewTab: entity data is missing. Rendering aborted.', {
      props,
    });
    return null;
  }

  return <Overview {...props} entity={entity} />;
};

OverviewTab.propTypes = {
  entity: PropTypes.object,
};

export default OverviewTab;
