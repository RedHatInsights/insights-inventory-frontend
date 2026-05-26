import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface ImportantProps {
  system: InventoryViewHost;
}

const Important = ({ system }: ImportantProps) => {
  const important = system?.app_data?.advisor?.important;

  return important;
};

export default Important;
