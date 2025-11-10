import React from 'react';
import PropTypes from 'prop-types';
import LoadingCard from '../LoadingCard';

const RhelAICard = ({ rhelAI }) => {
  return (
    <LoadingCard
      title="RHEL AI"
      cardId="rhel-ai-card"
      isLoading={false}
      items={[
        { title: 'Version', value: rhelAI?.rhel_ai_version_id },
        ...(rhelAI?.gpu_models?.length > 0
          ? [
              {
                title: 'GPU manufacturer',
                value: rhelAI.gpu_models.map((model) => model.vendor),
              },
            ]
          : []),
        { title: 'Models available', value: rhelAI?.gpu_models?.length },
        ...(rhelAI?.gpu_models?.length > 0
          ? [
              {
                title: 'GPU model',
                value: rhelAI.gpu_models.map((model) => model.name),
              },
            ]
          : []),
        ...(rhelAI?.gpu_models?.length > 0
          ? [
              {
                title: 'GPU memory',
                value: rhelAI.gpu_models.map((model) => model.memory),
              },
            ]
          : []),
      ]}
    />
  );
};

RhelAICard.propTypes = {
  rhelAI: PropTypes.shape({
    gpu_models: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        count: PropTypes.number,
        vendor: PropTypes.string,
        memory: PropTypes.string,
      }),
    ),
    rhel_ai_version_id: PropTypes.string,
    variant: PropTypes.string,
  }),
};

export default RhelAICard;
