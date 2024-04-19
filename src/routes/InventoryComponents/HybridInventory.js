import React, { Suspense, lazy, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import '../inventory.scss';
import HybridInventoryTabs from '../../components/InventoryTabs/HybridInventoryTabs';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useSearchParams } from 'react-router-dom';
import { getSearchParams } from '../../constants';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { AccountStatContext } from '../../Routes';

const ConventionalSystemsTab = lazy(() =>
  import(
    '../../components/InventoryTabs/ConventionalSystems/ConventionalSystemsTab'
  )
);
const ImmutableDevicesTab = lazy(() =>
  import('../../components/InventoryTabs/ImmutableDevices/EdgeDevicesTab')
);

const SuspenseWrapper = ({ children }) => (
  <Suspense
    fallback={
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    }
  >
    {children}
  </Suspense>
);
const HybridInventory = (props) => {
  const [searchParams] = useSearchParams();
  const parsedSearchParams = useMemo(
    () => getSearchParams(searchParams),
    [searchParams.toString()]
  );
  const fullProps = { ...props, ...parsedSearchParams };
  const isEdgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');
  const { hasEdgeDevices, hasConventionalSystems } =
    useContext(AccountStatContext);
  return (
    <HybridInventoryTabs
      ConventionalSystemsTab={
        <SuspenseWrapper>
          <ConventionalSystemsTab {...fullProps} {...parsedSearchParams} />
        </SuspenseWrapper>
      }
      ImmutableDevicesTab={
        <SuspenseWrapper>
          <ImmutableDevicesTab {...fullProps} {...parsedSearchParams} />
        </SuspenseWrapper>
      }
      isImmutableTabOpen={props.isImmutableTabOpen}
      isEdgeParityEnabled={isEdgeParityEnabled}
      accountHasEdgeImages={hasEdgeDevices}
      hasConventionalSystems={hasConventionalSystems}
    />
  );
};

HybridInventory.defaultProps = {
  initialLoading: true,
  notificationProp: PropTypes.object,
};
HybridInventory.propTypes = {
  isImmutableTabOpen: PropTypes.bool,
};
SuspenseWrapper.propTypes = {
  children: PropTypes.element,
};
export default HybridInventory;
