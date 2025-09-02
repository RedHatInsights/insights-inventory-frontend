import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { useParams } from 'react-router-dom';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const ComplianceTab = () => {
  const { inventoryId } = useParams();
  const systemProfile = useSelector(
    ({ entityDetails }) => entityDetails?.entity,
  );
  const connectedToInsights = !!systemProfile?.insights_id;

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
    />
  );
};

export default ComplianceTab;
