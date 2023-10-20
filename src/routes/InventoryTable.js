import React, { Suspense, lazy, useMemo } from 'react';
import PropTypes from 'prop-types';
import './inventory.scss';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
import HybridInventoryTabs from '../components/InventoryTabs/HybridInventoryTabs';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useLocation } from 'react-router-dom';
import { getSearchParams } from '../constants';
import useFeatureFlag from '../Utilities/useFeatureFlag';
const ConventionalSystemsTab = lazy(() =>
  import(
    '../components/InventoryTabs/ConventionalSystems/ConventionalSystemsTab'
  )
);
const ImmutableDevicesTab = lazy(() =>
  import('../components/InventoryTabs/ImmutableDevices/EdgeDevicesTab')
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
const Inventory = (props) => {
  const { search } = useLocation();
  const searchParams = useMemo(() => getSearchParams(), [search.toString()]);
  const fullProps = { ...props, ...searchParams };
  const isEdgeParityEnabled = useFeatureFlag('edgeParity.inventory-list');
  return (
    <React.Fragment>
      <PageHeader className="pf-m-light">
        <PageHeaderTitle title="Systems" />
      </PageHeader>
      <Main>
        <HybridInventoryTabs
          ConventionalSystemsTab={
            <SuspenseWrapper>
              <ConventionalSystemsTab {...fullProps} />
            </SuspenseWrapper>
          }
          ImmutableDevicesTab={
            <SuspenseWrapper>
              <ImmutableDevicesTab {...fullProps} />
            </SuspenseWrapper>
          }
          isImmutableTabOpen={props.isImmutableTabOpen}
          isEdgeParityEnabled={isEdgeParityEnabled}
        />
      </Main>
    </React.Fragment>
  );
};

Inventory.defaultProps = {
  initialLoading: true,
  notificationProp: PropTypes.object,
};
Inventory.propTypes = {
  isImmutableTabOpen: PropTypes.bool,
};
SuspenseWrapper.propTypes = {
  children: PropTypes.element,
};
export default Inventory;
