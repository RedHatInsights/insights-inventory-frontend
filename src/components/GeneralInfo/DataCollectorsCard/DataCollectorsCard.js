import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { dataCollectorsSelector } from '../selectors';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { TableComposable, Thead, Tr, Th, Tbody, Td, TableVariant } from '@patternfly/react-table';
import { Flex, FlexItem } from '@patternfly/react-core';

const getDefaultCollectors = (entity) => ([
    {
        name: 'insights-client',
        status: entity.per_reporter_staleness.puptoo?.check_in_succeeded,
        updated: entity.per_reporter_staleness.puptoo?.last_check_in,
        details: {
            name: 'Insights id',
            id: entity.insights_id
        }
    },
    {
        name: 'subscription-manager',
        status: entity.per_reporter_staleness.rhsm?.check_in_susseeded,
        updated: entity.per_reporter_staleness.rhsm?.last_check_in,
        details: {
            name: 'Subscription manager id',
            id: entity.subscription_manager_id
        }
    },
    {
        name: 'Satellite/Discovery',
        status: entity.per_reporter_staleness.yupana?.check_in_susseeded,
        updated: entity.per_reporter_staleness.yupana?.last_check_in
    }
]);

const DataCollectorsCard = ({
    detailLoaded,
    collectors,
    entity
}) => {
    const [expandedRepoNames, setExpandedRepoNames] = useState([]);
    const setRepoExpanded = (collector, isExpanding = true) =>
        setExpandedRepoNames(prevExpanded => {
            const otherExpandedRepoNames = prevExpanded.filter(r => r !== collector.name);
            return isExpanding ? [...otherExpandedRepoNames, collector.name] : otherExpandedRepoNames;
        });
    const isRepoExpanded = (collector) => expandedRepoNames.includes(collector.name);
    const data = collectors ?? getDefaultCollectors(entity);
    return (<LoadingCard
        title="Data collectors"
        isLoading={ !detailLoaded }
    >
        <TableComposable
            aria-label="Data collectors"
            variant={TableVariant.compact}
            borders={false}
        >
            <Thead>
                <Tr>
                    <Th />
                    <Th>{'Name'}</Th>
                    <Th>{'Status'}</Th>
                    <Th>{'Last upload'}</Th>
                </Tr>
            </Thead>
            <Tbody>
                {data.map((collector, rowIndex) => (<>
                    <Tr key={collector.name}>
                        <Td
                            expand={
                                collector.details
                                    ? {
                                        rowIndex,
                                        isExpanded: isRepoExpanded(collector),
                                        onToggle: () => setRepoExpanded(collector, !isRepoExpanded(collector))
                                    }
                                    : undefined
                            }
                        />
                        <Td dataLabel={'Name'}>{collector.name}</Td>
                        <Td dataLabel={'Status'}>{collector.status ? 'Active' : 'N/A'}</Td>
                        <Td dataLabel={'Last upload'}>{
                            DateFormat ?
                                <DateFormat date={ collector.updated } type="exact" /> :
                                new Date(collector.updated).toLocaleString()
                        }</Td>
                    </Tr>
                    {collector.details && (
                        <Tr isExpanded={isRepoExpanded(collector)}>
                            <Td colSpan={4}>
                                <Flex>
                                    <FlexItem>
                                        {`${collector.details.name}:`}
                                    </FlexItem>
                                    <FlexItem>
                                        {collector.details.id ?? 'N/A'}
                                    </FlexItem>
                                </Flex>
                            </Td>
                        </Tr>
                    )}
                </>))}
            </Tbody>
        </TableComposable>
    </LoadingCard>);
};

DataCollectorsCard.propTypes = {
    detailLoaded: PropTypes.bool,
    collectors: PropTypes.array,
    entity: PropTypes.shape({

    }),
    systemProfile: PropTypes.shape({

    })
};
DataCollectorsCard.defaultProps = {
    detailLoaded: false
};

export default connect(({
    entityDetails: {
        entity
    },
    systemProfileStore: {
        systemProfile
    }
}) => ({
    entity,
    systemProfile,
    detailLoaded: systemProfile && systemProfile.loaded,
    infrastructure: dataCollectorsSelector(systemProfile, entity)
}))(DataCollectorsCard);
