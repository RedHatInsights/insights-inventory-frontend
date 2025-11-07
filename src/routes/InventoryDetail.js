import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import './inventory.scss';
import * as actions from '../store/actions';
import InventoryDetail from '../components/InventoryDetail/InventoryDetail';
import { GeneralInformationTab } from '../components/SystemDetails';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP } from '../constants';
import ApplicationTab from '../ApplicationTab';
import { useLightspeedFeatureFlag } from '../Utilities/hooks/useLightspeedFeatureFlag';
import { getEntities as defaultGetEntities } from '../api';

const appList = {
  'CENTOS-LINUX': [
    {
      title: 'General information',
      name: 'general_information',
      component: GeneralInformationTab,
      //use this if you want to prefetch systemProfile above GeneralInformationTab
      systemProfilePrefetched: true,
    },
  ],
  RHEL: [
    {
      title: 'General information',
      name: 'general_information',
      component: GeneralInformationTab,
      systemProfilePrefetched: true,
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
      title: 'Patch',
      name: 'patch',
      component: (props) => (
        <ApplicationTab appName="patch" title="Patch" {...props} />
      ),
      nonEdge: true,
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

  const { hasAccess: canDeleteHost } = usePermissionsWithContext([
    REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP(
      entity?.groups?.[0]?.id ?? null, // null stands for ungroupped hosts
    ),
  ]);

  useEffect(() => {
    chrome?.hideGlobalFilter?.(true);
    chrome.appAction('system-detail');

    if (inventoryId) dispatch(actions.systemProfile(inventoryId));
  }, []);

  const additionalClasses = {
    'ins-c-inventory__detail--general-info':
      searchParams.get('appName') === 'general_information',
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
      activeApp={searchParams.get('appName')}
      appList={availableApps}
      onTabSelect={onTabSelect}
      entity={entity}
      fetchEntity={fetchEntity}
      entityError={entityError}
    />
  );
};

Inventory.contextTypes = {
  store: PropTypes.object,
};

export default Inventory;
