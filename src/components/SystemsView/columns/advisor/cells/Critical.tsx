import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface CriticalProps {
  system: InventoryViewHost;
}

const Critical = ({ system }: CriticalProps) => {
  const critical = system?.app_data?.advisor?.critical;

  return critical;
};

export default Critical;
