import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import {
  Content,
  ContentVariants,
  Icon,
  ClipboardCopy,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { getDefaultCollectors } from '../selectors/selectors';

const StatusIcon = ({ status }) => {
  const iconStyle = { marginLeft: 4, marginRight: 4 };
  if (status === 'Active') {
    return (
      <Icon status="success" style={iconStyle}>
        <CheckCircleIcon />
      </Icon>
    );
  }
  if (status === 'Stale') {
    return (
      <Icon status="warning" style={iconStyle}>
        <ExclamationTriangleIcon />
      </Icon>
    );
  }
  return null;
};

StatusIcon.propTypes = {
  status: PropTypes.string,
};

const DataCollectorsCardCore = ({
  detailLoaded = false,
  collectors,
  entity,
}) => {
  const data = collectors ?? getDefaultCollectors(entity);

  return (
    <LoadingCard
      cardId="dataCollector-card"
      title="Data collectors"
      isLoading={!detailLoaded}
      columnModifier="1Col"
      items={data.map((collector) => ({
        title: collector.name,
        value: (
          <Content component={ContentVariants.ul} isPlainList>
            <Content component={ContentVariants.li}>
              {collector.status === 'N/A' ? (
                <>Status: N/A</>
              ) : (
                <>
                  Status:
                  <StatusIcon status={collector.status} />
                  {collector.status}
                </>
              )}
            </Content>
            {collector.details?.name != null &&
              collector.details?.id != null &&
              collector.details?.id !== '' && (
                <Content component={ContentVariants.li}>
                  {collector.details.name}:{' '}
                  <ClipboardCopy isReadOnly variant="inline-compact">
                    {collector.details.id}
                  </ClipboardCopy>
                </Content>
              )}
            <Content component={ContentVariants.li}>
              Last upload:{' '}
              {collector.updated ? (
                <DateFormat date={collector.updated} type="exact" />
              ) : (
                'N/A'
              )}
            </Content>
          </Content>
        ),
      }))}
    />
  );
};

DataCollectorsCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  collectors: PropTypes.array,
  dataMapper: PropTypes.func,
  entity: PropTypes.shape({
    per_reporter_staleness: PropTypes.object,
  }),
};

export const DataCollectorsCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    systemProfile,
    detailLoaded: systemProfile?.loaded,
  }),
)(DataCollectorsCardCore);

DataCollectorsCard.propTypes = DataCollectorsCardCore.propTypes;

export default DataCollectorsCard;
