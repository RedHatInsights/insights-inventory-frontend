import React from 'react';
import PropTypes from 'prop-types';
import { useStore } from 'react-redux';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const ComplianceTab = ({ inventoryId, entity }) => {
  const connectedToInsights = !!entity?.insights_id;

  return (
    <AsyncComponent
      scope="compliance"
      module="./SystemDetail"
      store={useStore()}
      customItnl
      intlProps={{
        locale: navigator.language.slice(0, 2),
      }}
      inventoryId={inventoryId}
      connectedToInsights={connectedToInsights}
      remediationsEnabled
    />
  );
};

ComplianceTab.propTypes = {
  inventoryId: PropTypes.string.isRequired,
  entity: PropTypes.object.isRequired,
};

export default ComplianceTab;
