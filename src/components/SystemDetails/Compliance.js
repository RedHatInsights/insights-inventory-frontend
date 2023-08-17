import React from 'react';
import { useStore } from 'react-redux';
import { useParams } from 'react-router-dom';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const ComplianceTab = () => {
  const { inventoryId } = useParams('/:inventoryId');
  return (
    <AsyncComponent
      appName="compliance"
      module="./SystemDetail"
      store={useStore()}
      customItnl
      intlProps={{
        locale: navigator.language.slice(0, 2),
      }}
      inventoryId={inventoryId}
      remediationsEnabled
    />
  );
};

export default ComplianceTab;
