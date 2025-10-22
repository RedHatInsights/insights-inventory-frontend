import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { subscriptionsSelector } from '../selectors';

const SubscriptionCardCore = ({
  detailLoaded,
  entity,
  hasUsage,
  hasSLA,
  hasRole,
  systemProfile,
}) => {
  const subscriptionFacts = subscriptionsSelector(entity, systemProfile);
  return (
    <LoadingCard
      title="Subscriptions"
      cardId="subscriptions-card"
      isLoading={!detailLoaded}
      items={[
        ...(hasUsage
          ? [{ title: 'Usage', value: subscriptionFacts.usage }]
          : []),
        ...(hasSLA ? [{ title: 'SLA', value: subscriptionFacts.sla }] : []),
        ...(hasRole ? [{ title: 'Role', value: subscriptionFacts.role }] : []),
      ]}
    />
  );
};

SubscriptionCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  entity: PropTypes.object,
  hasUsage: PropTypes.bool,
  hasSLA: PropTypes.bool,
  hasRole: PropTypes.bool,
  systemProfile: PropTypes.shape({
    system_purpose: PropTypes.object,
  }),
};
SubscriptionCardCore.defaultProps = {
  detailLoaded: false,
  hasUsage: true,
  hasSLA: true,
  hasRole: true,
};

export const SubscriptionCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    detailLoaded: systemProfile && systemProfile.loaded,
    systemProfile,
  }),
)(SubscriptionCardCore);

SubscriptionCard.propTypes = SubscriptionCardCore.propTypes;
SubscriptionCard.defaultProps = SubscriptionCardCore.defaultProps;

export default SubscriptionCard;
