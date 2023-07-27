import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import RegistryContext from '../../store/registeryContext';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const RosTab = () => {
  const { inventoryId } = useParams();
  const { getRegistry } = useContext(RegistryContext);

  return (
    <AsyncComponent
      appName="ros"
      module="./SystemDetail"
      getRegistry={getRegistry}
      inventoryId={inventoryId}
    />
  );
};

export default RosTab;
