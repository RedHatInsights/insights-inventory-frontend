import axios from 'axios';
import { EDGE_API_BASE } from '../api';

export const getInventoryGroupDevicesUpdateInfo = async (groupUUID) => {
  const result = await axios.get(
    `${EDGE_API_BASE}/updates/inventory-groups/${groupUUID}/update-info`
  );
  return result?.data;
};
