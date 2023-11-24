import React, { useEffect, useState } from 'react';
import { inventoryHasConventionalSystems } from '../Utilities/conventional';
import { inventoryHasEdgeSystems } from '../Utilities/edge';
import useEdgeGroups from '../Utilities/hooks/useEdgeGroups';
import useFeatureFlag from '../Utilities/useFeatureFlag';
import PropTypes from 'prop-types';
import { Bullseye, Spinner } from '@patternfly/react-core';
import EdgeGroupsDetailsView from '../components/InventoryGroupDetail/EdgeGroupDetails';
import InventoryGroupDetail from './InventoryGroupDetail';

const InventoryOrEdgeGroupDetailsView = () => {
  const [enforceEdgeGroups, isLoading] = useEdgeGroups();
  const [hasConventionalSystems, setHasConventionalSystems] = useState(true);
  const [hasEdgeDevices, setHasEdgeDevices] = useState(true);
  const edgeParityInventoryListEnabled = useFeatureFlag(
    'edgeParity.inventory-list'
  );

  useEffect(() => {
    try {
      (async () => {
        const hasConventionalSystems = await inventoryHasConventionalSystems();
        if (edgeParityInventoryListEnabled) {
          const hasEdgeSystems = await inventoryHasEdgeSystems();
          setHasConventionalSystems(hasConventionalSystems);
          setHasEdgeDevices(hasEdgeSystems);
        }
      })();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const GroupsDetailComponents = enforceEdgeGroups
    ? EdgeGroupsDetailsView
    : InventoryGroupDetail;
  if (!isLoading) {
    return (
      <GroupsDetailComponents
        hasConventionalSystems={hasConventionalSystems}
        hasEdgeDevices={hasEdgeDevices}
      />
    );
  } else {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }
};

InventoryOrEdgeGroupDetailsView.prototype = {
  enforceEdgeGroups: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default InventoryOrEdgeGroupDetailsView;
