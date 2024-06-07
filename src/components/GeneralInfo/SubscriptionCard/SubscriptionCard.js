import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { subscriptionsSelector } from '../selectors';

const SubscriptionCardCore = ({
  subscriptionFacts,
  detailLoaded,
  hasUsage,
  hasSLA,
  hasRole,
}) => {
  return (
    <LoadingCard
      title="Subscriptions"
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
  subscriptionFacts: PropTypes.shape({
    usage: PropTypes.string,
    sla: PropTypes.string,
    role: PropTypes.string,
  }),
  hasUsage: PropTypes.bool,
  hasSLA: PropTypes.bool,
  hasRole: PropTypes.bool,
};
SubscriptionCardCore.defaultProps = {
  detailLoaded: false,
  hasUsage: true,
  hasSLA: true,
  hasRole: true,
};

export const SubscriptionCard = connect(
  ({ entityDetails: { entity }, systemProfileStore: { systemProfile } }) => ({
    subscriptionFacts: subscriptionsSelector(entity),
    detailLoaded: systemProfile && systemProfile.loaded,
  })
)(SubscriptionCardCore);

SubscriptionCard.propTypes = SubscriptionCardCore.propTypes;
SubscriptionCard.defaultProps = SubscriptionCardCore.defaultProps;

export default SubscriptionCard;
