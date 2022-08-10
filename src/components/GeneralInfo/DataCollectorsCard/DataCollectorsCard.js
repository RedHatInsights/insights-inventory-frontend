/* eslint-disable camelcase */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { TableComposable, Thead, Tr, Th, Tbody, Td, TableVariant, ExpandableRowContent } from '@patternfly/react-table';
import { Flex, FlexItem } from '@patternfly/react-core';
import { getDefaultCollectors } from '../selectors/selectors';

const DataCollectorsCardCore = ({
    detailLoaded,
    collectors,
    entity,
    dataMapper
}) => {
    const [expandedNames, setExpandedNames] = useState([]);
    const setExpanded = useCallback((collector, isExpanding = true) => setExpandedNames(prevExpanded => {
        const otherExpandedNames = prevExpanded.filter(r => r !== collector.name);
        return isExpanding ? [...otherExpandedNames, collector.name] : otherExpandedNames;
    }), []);
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
                <Tr className="ins-c__no-border">
                    <Th />
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Last upload</Th>
                </Tr>
            </Thead>
            {dataMapper ? dataMapper(data, isExpanded, setExpanded) : data.map((collector, rowIndex) => (
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
                        <Td dataLabel="Name">{collector.name}</Td>
                        <Td dataLabel="Status">{collector.status}</Td>
                        <Td dataLabel="Last upload">
                            {collector.updated ?
                                <DateFormat date={ collector.updated } type="exact" /> :
                                'N/A'
                            }</Td>
                    </Tr>
                    {collector.details && collector.details.name && (
                        <Tr isExpanded={isExpanded(collector)}>
                            <Td />
                            <Td colSpan={3}>
                                <ExpandableRowContent>
                                    <Flex>
                                        <FlexItem className="ins-c__flex-row-margin">
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

DataCollectorsCardCore.propTypes = {
    detailLoaded: PropTypes.bool,
    collectors: PropTypes.array,
    dataMapper: PropTypes.func,
    entity: PropTypes.shape({
        per_reporter_staleness: PropTypes.object
    })
};
DataCollectorsCardCore.defaultProps = {
    detailLoaded: false
};

export const DataCollectorsCard = connect(({
    entityDetails: {
        entity
    },
    systemProfileStore: {
        systemProfile
    }
}) => ({
    entity,
    systemProfile,
    detailLoaded: systemProfile?.loaded,
    defaultCollectors: getDefaultCollectors(entity)
}))(DataCollectorsCardCore);

DataCollectorsCard.propTypes = DataCollectorsCardCore.propTypes;
DataCollectorsCard.defaultProps = DataCollectorsCardCore.defaultProps;

export default DataCollectorsCard;
