import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { Bullseye, Spinner } from '@patternfly/react-core';
import './inventory.scss';
import * as actions from '../store/actions';
import InventoryDetail from '../components/InventoryDetail/InventoryDetail';
import { OverviewTab, DetailsTab } from '../components/SystemDetails';
import { useConditionalRBAC } from '../Utilities/hooks/useConditionalRBAC';
import { useHostDetailsKesselPermissions } from '../Utilities/hooks/useHostDetailsKesselPermissions';
import { useKesselMigrationFeatureFlag } from '../Utilities/hooks/useKesselMigrationFeatureFlag';
import AccessDenied from '../Utilities/AccessDenied';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import { REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP } from '../constants';
import ApplicationTab from '../ApplicationTab';
import { useLightspeedFeatureFlag } from '../Utilities/hooks/useLightspeedFeatureFlag';
import { getEntities as defaultGetEntities } from '../api';

const appList = {
  'CENTOS-LINUX': [
    {
      title: 'Overview',
      name: 'overview',
      component: OverviewTab,
      systemProfilePrefetched: true,
    },
    {
      title: 'Details',
      name: 'details',
      component: DetailsTab,
      systemProfilePrefetched: true,
    },
  ],
  RHEL: [
    {
      title: 'Overview',
      name: 'overview',
      component: OverviewTab,
      systemProfilePrefetched: true,
    },
    {
      title: 'Details',
      name: 'details',
      component: DetailsTab,
      systemProfilePrefetched: true,
    },
    {
      title: 'Content',
      name: 'patch',
      component: (props) => (
        <ApplicationTab appName="patch" title="Content" {...props} />
      ),
      nonEdge: true,
    },
    {
      title: 'Advisor',
      name: 'advisor',
      component: (props) => (
        <ApplicationTab appName="advisor" title="Advisor" {...props} />
      ),
    },
    {
      title: 'Vulnerability',
      name: 'vulnerabilities',
      component: (props) => (
        <ApplicationTab
          appName="vulnerability"
          title="Vulnerability"
          {...props}
        />
      ),
    },
    {
      title: 'Compliance',
      name: 'compliance',
      component: (props) => (
        <ApplicationTab appName="compliance" title="Compliance" {...props} />
      ),
      nonEdge: true,
      nonImage: true,
    },
    {
      title: 'Resource Optimization',
      name: 'ros',
      isVisible: false,
      component: (props) => <ApplicationTab appName="ros" {...props} />,
      nonEdge: true,
    },
  ],
};

const Inventory = () => {
  const platformName = useLightspeedFeatureFlag();
  const chrome = useChrome();
  const { inventoryId } = useParams();
  const [searchParams] = useSearchParams();
  const store = useStore();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [availableApps, setAvailableApps] = useState([]);
  const [entity, setEntity] = useState({});
  const [entityError, setEntityError] = useState(null);

  const fetchEntity = useCallback(async () => {
    try {
      const result = await defaultGetEntities(
        inventoryId,
        { hasItems: true },
        { showTags: true },
      );
      setEntity(result?.results?.[0] || undefined);
      setEntityError(null);
    } catch (error) {
      console.error(error);
      setEntityError(error);
    }
  }, [inventoryId]);

  useEffect(() => {
    const handleFetchEntity = async () => {
      await fetchEntity();
    };
    handleFetchEntity();
  }, [fetchEntity]);

  const { cloud_provider: cloudProvider, host_type: hostType } = useSelector(
    ({ systemProfileStore }) => systemProfileStore?.systemProfile || [],
  );

  useEffect(() => {
    let osSlug =
      entity?.system_profile?.operating_system?.name
        .replace(' ', '-')
        .toUpperCase() || 'RHEL';

    let imageModeSystem = !!entity?.system_profile?.bootc_status;
    let newApps =
      entity &&
      appList[osSlug]?.map((app) => {
        app.isDisabled =
          (app.nonEdge && hostType === 'edge') ||
          (app.nonImage && imageModeSystem === true);
        app['data-cy'] = `${app.name}-tab`;

        if (app.name === 'ros') {
          app.isVisible = cloudProvider === 'aws';
        }

        return app;
      });

    setAvailableApps(newApps);
  }, [entity, cloudProvider, hostType]);

  const { hasAccess: canModifyHostByRbac } = useConditionalRBAC([
    REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
      entity?.groups?.[0]?.id ?? null, // null stands for ungroupped hosts
    ),
  ]);

  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const {
    canView: kesselCanView,
    canUpdate: kesselCanUpdate,
    canDelete: kesselCanDelete,
    isLoading: kesselPermissionsLoading,
  } = useHostDetailsKesselPermissions(inventoryId);

  // Kessel off: RBAC for delete and inline edit. Kessel on: Kessel relations (delete / update); disable while permissions load.
  const showDelete = isKesselEnabled
    ? !kesselPermissionsLoading && kesselCanDelete === true
    : canModifyHostByRbac;

  const writePermissions = isKesselEnabled
    ? !kesselPermissionsLoading && kesselCanUpdate === true
    : canModifyHostByRbac;

  useEffect(() => {
    chrome?.hideGlobalFilter?.(true);
    chrome.appAction('system-detail');

    if (inventoryId) dispatch(actions.systemProfile(inventoryId));
  }, []);

  const additionalClasses = {
    'ins-c-inventory__detail--general-info':
      searchParams.get('appName') === 'overview' ||
      searchParams.get('appName') === 'details',
  };

  if (entity) {
    document.title = `${entity.display_name} | Systems | Red Hat ${platformName}`;
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
        { replace: true },
      );
    },
    [searchParams],
  );

  if (entityError?.status === 400) {
    return (
      <div className="ins-entity-detail">
        <ErrorState />
      </div>
    );
  }

  if (isKesselEnabled && inventoryId) {
    if (kesselPermissionsLoading) {
      return (
        <Bullseye className="pf-v6-u-p-xl">
          <Spinner aria-label="Loading permissions" />
        </Bullseye>
      );
    }

    if (kesselCanView === false) {
      return (
        <AccessDenied
          title="You do not have access to this system"
          description={
            <div>
              You do not have permission to view this system in inventory.
            </div>
          }
        />
      );
    }
  }

  return (
    <InventoryDetail
      additionalClasses={additionalClasses}
      hideInvDrawer
      showDelete={showDelete}
      hideInvLink
      hideBack
      inventoryId={inventoryId}
      showTags
      showMainSection
      fallback=""
      store={store}
      isInventoryApp
      shouldWrapAsPage
      activeApp={searchParams.get('appName')}
      appList={availableApps}
      onTabSelect={onTabSelect}
      entity={entity}
      fetchEntity={fetchEntity}
      entityError={entityError}
      writePermissions={writePermissions}
    />
  );
};

Inventory.contextTypes = {
  store: PropTypes.object,
};

export default Inventory;
