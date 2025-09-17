import axios from 'axios';
import {
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  INVENTORY_FETCH_BOOTC,
} from './constants';

const manageEdgeInventoryUrlName = 'manage-edge-inventory';

const getNotificationProp = (addNotification) => {
  return {
    hasInfo: (hasInfoMessage) => {
      addNotification({
        variant: 'info',
        ...hasInfoMessage,
      });
    },
    hasSuccess: (hasSuccessMessage) => {
      addNotification({
        variant: 'success',
        ...hasSuccessMessage,
      });
    },
    hasWarning: (hasSuccessMessage) => {
      addNotification({
        variant: 'warning',
        ...hasSuccessMessage,
      });
    },
    err: (errMessage, err) => {
      addNotification({
        variant: 'danger',
        ...errMessage,
        // Add error message from API, if present
        description: err?.Title
          ? `${errMessage.description}: ${err.Title}`
          : errMessage.description,
      });
    },
  };
};

const inventoryHasBootcImages = async () => {
  const result = await axios.get(
    `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&per_page=1`,
  );
  return result?.data?.total > 0;
};

const enhancedEdgeConfig = (groupName, config) => {
  return {
    ...config,
    filters: {
      ...config.filters,
      hostGroupFilter: [groupName],
      hostTypeFilter: 'edge',
    },
    hasItems: false,
  };
};

const mapDefaultData = (result) => {
  let mapDeviceIds = [];
  result.forEach((data) => {
    mapDeviceIds.push(data.id);
  });
  return {
    mapDeviceIds,
  };
};

export {
  getNotificationProp,
  manageEdgeInventoryUrlName,
  enhancedEdgeConfig,
  mapDefaultData,
  inventoryHasBootcImages,
};
