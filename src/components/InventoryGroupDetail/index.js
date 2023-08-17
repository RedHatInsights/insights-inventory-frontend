import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InventoryGroupDetail from './InventoryGroupDetail';

const InventoryGroupDetailWrapper = () => {
  const { groupId } = useParams();
  const chrome = useChrome();

  useEffect(() => {
    chrome?.hideGlobalFilter?.();
  }, []);

  return <InventoryGroupDetail groupId={groupId} />;
};

export default InventoryGroupDetailWrapper;
