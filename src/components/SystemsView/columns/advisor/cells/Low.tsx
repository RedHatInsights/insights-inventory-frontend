import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface LowProps {
  system: InventoryViewHost;
}

const Low = ({ system }: LowProps) => {
  const low = system?.app_data?.advisor?.low;

  return low;
};

export default Low;
