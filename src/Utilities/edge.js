import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import axios from 'axios';
import {
  INVENTORY_TOTAL_FETCH_EDGE_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
} from './constants';

const manageEdgeInventoryUrlName = 'manage-edge-inventory';

const getNotificationProp = (dispatch) => {
  return {
    hasInfo: (hasInfoMessage) => {
      dispatch({
        ...addNotification({
          variant: 'info',
          ...hasInfoMessage,
        }),
      });
    },
    hasSuccess: (hasSuccessMessage) => {
      dispatch({
        ...addNotification({
          variant: 'success',
          ...hasSuccessMessage,
        }),
      });
    },
    hasWarning: (hasSuccessMessage) => {
      dispatch({
        ...addNotification({
          variant: 'warning',
          ...hasSuccessMessage,
        }),
      });
    },
    err: (errMessage, err) => {
      dispatch({
        ...addNotification({
          variant: 'danger',
          ...errMessage,
          // Add error message from API, if present
          description: err?.Title
            ? `${errMessage.description}: ${err.Title}`
            : errMessage.description,
        }),
      });
    },
  };
};

const inventoryHasEdgeSystems = async () => {
  const result = await axios.get(
    `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_EDGE_PARAMS}`
  );
  return result?.data?.total > 0;
};

export {
  getNotificationProp,
  manageEdgeInventoryUrlName,
  inventoryHasEdgeSystems,
};
