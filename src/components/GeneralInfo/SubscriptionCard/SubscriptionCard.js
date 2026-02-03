import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard, { getDefaultColumnModifier } from '../LoadingCard';
import { subscriptionsSelector } from '../selectors';

const SubscriptionCardCore = ({
  detailLoaded = false,
  entity,
  hasUsage = true,
  hasSLA = true,
  hasRole = true,
  systemProfile,
}) => {
  const subscriptionFacts = subscriptionsSelector(entity, systemProfile);
  const items = [
    ...(hasUsage ? [{ title: 'Usage', value: subscriptionFacts.usage }] : []),
    ...(hasSLA ? [{ title: 'SLA', value: subscriptionFacts.sla }] : []),
    ...(hasRole ? [{ title: 'Role', value: subscriptionFacts.role }] : []),
  ];
  return (
    <LoadingCard
      title="Subscriptions"
      cardId="subscriptions-card"
      isLoading={!detailLoaded}
      columnModifier={getDefaultColumnModifier(items)}
      items={items}
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

export const SubscriptionCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    detailLoaded: systemProfile && systemProfile.loaded,
    systemProfile,
  }),
)(SubscriptionCardCore);

SubscriptionCard.propTypes = SubscriptionCardCore.propTypes;

export default SubscriptionCard;
