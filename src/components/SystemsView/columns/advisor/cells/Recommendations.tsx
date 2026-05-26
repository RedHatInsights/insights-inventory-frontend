import { InventoryViewHost } from '../../../hooks/useInventoryViewsQuery';

interface RecommendationsProps {
  system: InventoryViewHost;
}

const Recommendations = ({ system }: RecommendationsProps) => {
  const recommendations = system?.app_data?.advisor?.recommendations ?? 'N/A';

  return recommendations;
};

export default Recommendations;
