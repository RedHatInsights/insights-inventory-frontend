import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface CriticalProps {
  system: InventoryViewHost;
}

const Critical = ({ system }: CriticalProps) => {
  const critical = system?.app_data?.advisor?.critical ?? 'N/A';

  return critical;
};

export default Critical;
