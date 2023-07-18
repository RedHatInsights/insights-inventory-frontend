import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import './inventory.scss';
import * as actions from '../store/actions';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import { routes } from '../Routes';
import InventoryDetail from '../components/InventoryDetail/InventoryDetail';
import { useHostsWritePermissions } from '../Utilities/constants';
import {
  AdvisorTab,
  ComplianceTab,
  GeneralInformationTab,
  PatchTab,
  RosTab,
  VulnerabilityTab,
} from '../components/SystemDetails';

const appList = [
  {
    title: 'General information',
    name: 'general_information',
    component: GeneralInformationTab,
    //use this if you want to prefetch systemProfile above GeneralInformationTab
    systemProfilePrefetched: true,
  },
  {
    title: 'Advisor',
    name: 'advisor',
    component: AdvisorTab,
  },
  {
    title: 'Vulnerability',
    name: 'vulnerabilities',
    component: VulnerabilityTab,
  },
  {
    title: 'Compliance',
    name: 'compliance',
    component: ComplianceTab,
    nonEdge: true,
  },
  {
    title: 'Patch',
    name: 'patch',
    component: PatchTab,
    nonEdge: true,
  },
  {
    title: 'Resource Optimization',
    name: 'ros',
    isVisible: false,
    component: RosTab,
    nonEdge: true,
  },
];

const BreadcrumbWrapper = ({ entity, inventoryId, entityLoaded }) => (
  <Breadcrumb ouiaId="systems-list">
    <BreadcrumbItem>
      <Link to={routes.table}>Systems</Link>
    </BreadcrumbItem>
    <BreadcrumbItem isActive>
      <div className="ins-c-inventory__detail--breadcrumb-name">
        {entity ? (
          entity.display_name
        ) : entityLoaded !== true ? (
          <Skeleton size={SkeletonSize.xs} />
        ) : (
          inventoryId
        )}
      </div>
    </BreadcrumbItem>
  </Breadcrumb>
);

const Inventory = () => {
  const chrome = useChrome();
  const { inventoryId } = useParams();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [activeApp] = useState(searchParams.get('appName') || appList[0].name);
  const store = useStore();
  const history = useHistory();
  const dispatch = useDispatch();
  const writePermissions = useHostsWritePermissions();
  const entityLoaded = useSelector(
    ({ entityDetails }) => entityDetails?.loaded
  );
  const entity = useSelector(({ entityDetails }) => entityDetails?.entity);
  const { cloud_provider: cloudProvider, host_type: hostType } = useSelector(
    ({ systemProfileStore }) => systemProfileStore?.systemProfile || []
  );
  const availableApps = useMemo(
    () =>
      appList.map((app) =>
        app.name === 'ros'
          ? {
              ...app,
              isVisible: cloudProvider === 'aws',
            }
          : app
      ),
    [cloudProvider]
  );
  const clearNotifications = () => dispatch(actions.clearNotifications());

  useEffect(() => {
    chrome?.hideGlobalFilter?.(true);
    chrome.appAction('system-detail');
    clearNotifications();

    inventoryId && dispatch(actions.systemProfile(inventoryId));
  }, []);

  const additionalClasses = {
    'ins-c-inventory__detail--general-info':
      activeApp === 'general_information',
  };

  if (entity) {
    document.title = `${entity.display_name} | Systems | Red Hat Insights`;
  }

  useEffect(() => {
    chrome?.appObjectId?.(entity?.id);
  }, [entity?.id]);

  const onTabSelect = useCallback(
    (_, activeApp, appName) => {
      searchParams.set('appName', appName);
      const search = searchParams.toString();
      history.push({
        search,
      });
    },
    [searchParams]
  );

  const apps =
    availableApps?.map((app) => {
      app.isDisabled = app.nonEdge && hostType === 'edge' ? true : false;
      app['data-cy'] = `${app.name}-tab`;

      return app;
    }) || [];

  return (
    <InventoryDetail
      additionalClasses={additionalClasses}
      hideInvDrawer
      showDelete={writePermissions}
      hideInvLink
      hideBack
      inventoryId={inventoryId}
      showTags
      showMainSection
      fallback=""
      store={store}
      history={history}
      isInventoryApp
      shouldWrapAsPage
      BreadcrumbWrapper={
        <BreadcrumbWrapper
          entity={entity}
          entityLoaded={entityLoaded}
          inventoryId={inventoryId}
        />
      }
      activeApp={activeApp}
      appList={apps}
      onTabSelect={onTabSelect}
    />
  );
};

BreadcrumbWrapper.propTypes = {
  entity: PropTypes.object,
  entityLoaded: PropTypes.bool,
  inventoryId: PropTypes.string,
};

Inventory.contextTypes = {
  store: PropTypes.object,
};

export default Inventory;
