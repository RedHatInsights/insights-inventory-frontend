import React, { useEffect } from 'react';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import {
  useLocation,
  useParams,
} from 'react-router-dom';

const SystemUpdate = () => {
  const chrome = useChrome();

  useEffect(() => {
    chrome?.updateDocumentTitle?.('Inventory Groups | Red Hat Insights');
  }, [chrome]);
  const { inventoryId } = useParams();

  return inventoryId !== null ? (
    // <AsyncComponent
    //   appName="edge"
    //   module="./UpdateSystem"
    //   locationProp={useLocation}
    //   paramsProp={useParams}
    //   inventoryId={inventoryId}
    // />
    <div> removed edge update component</div>
  ) : (
    <></>
  );
};

export default SystemUpdate;
