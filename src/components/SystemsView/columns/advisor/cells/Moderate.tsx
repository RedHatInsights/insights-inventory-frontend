import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface ModerateProps {
  system: InventoryViewHost;
}

const Moderate = ({ system }: ModerateProps) => {
  const moderate = system?.app_data?.advisor?.moderate ?? 'N/A';

  return moderate;
};

export default Moderate;
