import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface IncidentsProps {
  system: InventoryViewHost;
}

const Incidents = ({ system }: IncidentsProps) => {
  const incidents = system?.app_data?.advisor?.incidents ?? 'N/A';

  return incidents;
};

export default Incidents;
