import React from 'react';
import PropTypes from 'prop-types';
import './inventory.scss';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
import ConventionalSystemsTab from '../components/InventoryTabs/ConventionalSystems/ConventionalSystemsTab';
import ImmutableDevicesTab from '../components/InventoryTabs/ImmutableDevices/EdgeDevicesTab';
import HybridInventoryTabs from '../components/InventoryTabs/HybridInventoryTabs';

const Inventory = (props) => {
  return (
    <React.Fragment>
      <PageHeader className="pf-m-light">
        <PageHeaderTitle title="Systems" />
      </PageHeader>
      <Main>
        <HybridInventoryTabs
          ConventionalSystemsTab={<ConventionalSystemsTab {...props} />}
          ImmutableDevicesTab={<ImmutableDevicesTab />}
          isImmutableTabOpen={props.isImmutableTabOpen}
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
export default Inventory;
