import axios from 'axios';
import {
  INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS,
  INVENTORY_TOTAL_FETCH_URL_SERVER,
} from './constants';

const inventoryHasConventionalSystems = async () => {
  const result = await axios.get(
    `${INVENTORY_TOTAL_FETCH_URL_SERVER}${INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS}`
  );
  return result?.data?.total > 0;
};

export { inventoryHasConventionalSystems };
