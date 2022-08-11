import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem, Flex, FlexItem } from '@patternfly/react-core';
import { Skeleton, SkeletonSize } from '@redhat-cloud-services/frontend-components/Skeleton';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { getFact } from './helpers';
import InsightsDisconnected from '../../Utilities/InsightsDisconnected';
import { verifyCulledInsightsClient } from '../../Utilities/sharedFunctions';
/**
 * Basic information about system.
 * UUID and last seen.
 * @param {*} props entity and if entity is loaded.
 */
const FactsInfo = ({ entity, loaded, UUIDWrapper, LastSeenWrapper, ...props }) => (
    <Grid className="ins-entity-facts" { ...props }>
        <GridItem md={ 6 }>
            <Flex>
                <FlexItem>UUID:</FlexItem>
                <FlexItem grow={{ default: 'grow' }}>
                    {loaded ? getFact(`id`, entity) || ' ' : <Skeleton size={SkeletonSize.md} fontSize="sm" />}
                </FlexItem>
            </Flex>
            <Flex>
                <FlexItem>Last seen:</FlexItem>
                <FlexItem grow={{ default: 'grow' }}>
                    {
                        loaded ?
                            <LastSeenWrapper>{
                                (
                                    CullingInformation ? <CullingInformation
                                        culled={getFact('culled_timestamp', entity)}
                                        staleWarning={getFact('stale_warning_timestamp', entity)}
                                        stale={getFact('stale_timestamp', entity)}
                                        currDate={new Date()}
                                    >
                                        <DateFormat date={getFact('updated', entity)} type="exact" />
                                    </CullingInformation> : <DateFormat date={getFact('updated', entity)} type="exact" />
                                )}
                            </LastSeenWrapper> :
                            <Skeleton size={SkeletonSize.md} fontSize="sm" />
                    }
                    {loaded && verifyCulledInsightsClient(getFact('per_reporter_staleness', entity)) && <InsightsDisconnected />}
                </FlexItem>
            </Flex>
        </GridItem>
    </Grid>
);

FactsInfo.propTypes = {
    loaded: PropTypes.bool,
    entity: PropTypes.object,
    UUIDWrapper: PropTypes.elementType,
    LastSeenWrapper: PropTypes.elementType
};

FactsInfo.defaultProps = {
    UUIDWrapper: Fragment,
    LastSeenWrapper: Fragment
};

export default FactsInfo;
