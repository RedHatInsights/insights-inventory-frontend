import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { dataCollectorsSelector } from '../selectors';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { TableComposable, Thead, Tr, Th, Tbody, Td, TableVariant, ExpandableRowContent } from '@patternfly/react-table';
import { Flex, FlexItem } from '@patternfly/react-core';
import { registered } from '../../../Utilities/index';

const getDefaultCollectors = (entity) =>
    registered?.filter(reporter => reporter.label !== 'insights-client not connected')
    .map(reporter => ({
        name: reporter.label,
        status: entity.per_reporter_staleness[reporter.value]?.check_in_succeeded,
        updated: entity.per_reporter_staleness[reporter.value]?.last_check_in,
        details: {
            name: reporter.idName,
            id: entity[reporter.idValue]
        }
    }));

const DataCollectorsCard = ({
    detailLoaded,
    collectors,
    entity
}) => {
    const [expandedNames, setExpandedNames] = useState([]);
    const setExpanded = (collector, isExpanding = true) =>
        setExpandedNames(prevExpanded => {
            const otherExpandedNames = prevExpanded.filter(r => r !== collector.name);
            return isExpanding ? [...otherExpandedNames, collector.name] : otherExpandedNames;
        });
    const isExpanded = (collector) => expandedNames.includes(collector.name);
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
                <Tr style={{ border: 'none' }}>
                    <Th />
                    <Th>{'Name'}</Th>
                    <Th>{'Status'}</Th>
                    <Th>{'Last upload'}</Th>
                </Tr>
            </Thead>
            {data.map((collector, rowIndex) => (
                <Tbody key={collector.name} isExpanded={isExpanded(collector)}>
                    <Tr>
                        {collector.details.name ?
                            <Td
                                expand={
                                    collector.details
                                        ? {
                                            rowIndex,
                                            isExpanded: isExpanded(collector),
                                            onToggle: () => setExpanded(collector, !isExpanded(collector))
                                        }
                                        : undefined
                                }
                                style={{ paddingLeft: 0 }}
                            /> : <Td />}
                        <Td dataLabel={'Name'}>{collector.name}</Td>
                        <Td dataLabel={'Status'}>{collector.status ? 'Active' : 'N/A'}</Td>
                        <Td dataLabel={'Last upload'}>{
                            DateFormat ?
                                <DateFormat date={ collector.updated } type="exact" /> :
                                new Date(collector.updated).toLocaleString()
                        }</Td>
                    </Tr>
                    {collector.details && collector.details.name && (
                        <Tr isExpanded={isExpanded(collector)}>
                            <Td />
                            <Td colSpan={3}>
                                <ExpandableRowContent
                                    style={{ paddingTop: 5, paddingBottom: 5 }}>
                                    <Flex>
                                        <FlexItem style={{ marginRight: 5 }}>
                                            {`${collector.details.name}:`}
                                        </FlexItem>
                                        <FlexItem grow={{ default: 'grow' }}>
                                            {collector.details.id ?? 'N/A'}
                                        </FlexItem>
                                    </Flex>
                                </ExpandableRowContent>
                            </Td>
                        </Tr>
                    )}
                </Tbody>))}
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
