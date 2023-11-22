import React, { useEffect, useState } from 'react';
import EdgeGroupsView from '../components/InventoryGroups/EdgeGroups';
import InventoryGroups from '../components/InventoryGroups/InventoryGroups';
import { inventoryHasConventionalSystems } from '../Utilities/conventional';
import { inventoryHasEdgeSystems } from '../Utilities/edge';
import useEdgeGroups from '../Utilities/hooks/useEdgeGroups';
import useFeatureFlag from '../Utilities/useFeatureFlag';
import PropTypes from 'prop-types';
import { Bullseye, Spinner } from '@patternfly/react-core';

const InventoryOrEdgeView = () => {
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

  const ViewComponent = enforceEdgeGroups ? EdgeGroupsView : InventoryGroups;
  if (!isLoading) {
    return (
      <ViewComponent
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

InventoryOrEdgeView.prototype = {
  enforceEdgeGroups: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default InventoryOrEdgeView;
