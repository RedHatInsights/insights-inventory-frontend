import axios from 'axios';
import {
  INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
  INVENTORY_FETCH_BOOTC,
} from './constants';

const inventoryHasConventionalSystems = async () => {
  const result = await axios.get(
    `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS}`,
  );
  return result?.data?.total > 0;
};

const inventoryHasBootcImages = async () => {
  const result = await axios.get(
    `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_FETCH_BOOTC}&per_page=1`,
  );
  return result?.data?.total > 0;
};

export { inventoryHasConventionalSystems, inventoryHasBootcImages };
