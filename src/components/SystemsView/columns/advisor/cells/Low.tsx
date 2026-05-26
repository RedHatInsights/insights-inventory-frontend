import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface LowProps {
  system: InventoryViewHost;
}

const Low = ({ system }: LowProps) => {
  const low = system?.app_data?.advisor?.low ?? 'N/A';

  return low;
};

export default Low;
