import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import './inventory.scss';
import * as actions from '../store/actions';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import {
  Skeleton,
  SkeletonSize,
} from '@redhat-cloud-services/frontend-components/Skeleton';
import InventoryDetail from '../components/InventoryDetail/InventoryDetail';
import {
  AdvisorTab,
  ComplianceTab,
  GeneralInformationTab,
  PatchTab,
  RosTab,
  VulnerabilityTab,
} from '../components/SystemDetails';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP } from '../constants';

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
      <Link to="..">Systems</Link>
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
  const store = useStore();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  useEffect(() => {
    if (searchParams.get('appName') === null) {
      searchParams.set('appName', appList[0].name);
      navigate(
        {
          search: searchParams.toString(),
        },
        { replace: true }
      );
    }
  }, []);

  const clearNotifications = () => dispatch(actions.clearNotifications());

  const { hasAccess: canDeleteHost } = usePermissionsWithContext([
    REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
      entity?.groups?.[0]?.id ?? null // null stands for ungroupped hosts
    ),
  ]);

  useEffect(() => {
    chrome?.hideGlobalFilter?.(true);
    chrome.appAction('system-detail');
    clearNotifications();

    inventoryId && dispatch(actions.systemProfile(inventoryId));
  }, []);

  const additionalClasses = {
    'ins-c-inventory__detail--general-info':
      searchParams.get('appName') === 'general_information',
  };

  if (entity) {
    document.title = `${entity.display_name} | Systems | Red Hat Insights`;
  }

  useEffect(() => {
    chrome?.appObjectId?.(entity?.id);
  }, [entity?.id]);

  const onTabSelect = useCallback(
    (_, __, appName) => {
      navigate(
        {
          search: `?appName=${appName}`,
        },
        { replace: true }
      );
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
      showDelete={canDeleteHost}
      hideInvLink
      hideBack
      inventoryId={inventoryId}
      showTags
      showMainSection
      fallback=""
      store={store}
      isInventoryApp
      shouldWrapAsPage
      BreadcrumbWrapper={
        <BreadcrumbWrapper
          entity={entity}
          entityLoaded={entityLoaded}
          inventoryId={inventoryId}
        />
      }
      activeApp={searchParams.get('appName')}
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
