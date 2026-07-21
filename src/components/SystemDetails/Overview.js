import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem } from '@patternfly/react-core';
import SystemDetailsModal from './SystemDetailsModal';
import '../GeneralInfo/system-details.scss';
import { SystemStatusCard } from '../GeneralInfo/SystemStatusCard';
import SystemCard from '../GeneralInfo/SystemCard';
import { DataCollectorsCard } from '../GeneralInfo/DataCollectorsCard/DataCollectorsCard';
import { SubscriptionCard } from '../GeneralInfo/SubscriptionCard';
import { ConversionAlert } from '../GeneralInfo/ConversionAlert';
import { Provider } from 'react-redux';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import useModalState from './hooks/useModalState';

const Overview = ({
  store,
  writePermissions,
  SystemCardWrapper = SystemCard,
  SystemStatusCardWrapper = SystemStatusCard,
  DataCollectorsCardWrapper = DataCollectorsCard,
  SubscriptionCardWrapper = SubscriptionCard,
  navigate,
  entity = {},
  inventoryId,
  systemProfilePrefetched = false,
  fetchEntity,
}) => {
  const {
    isModalOpen,
    modalTitle,
    modalVariant,
    modalData,
    onSort,
    handleModalToggle,
  } = useModalState(navigate);

  useEffect(() => {
    if (entity?.id && !systemProfilePrefetched) {
      fetchEntity?.(inventoryId || entity.id);
    }
  }, [entity.id, inventoryId, fetchEntity, systemProfilePrefetched]);

  const Wrapper = store ? Provider : Fragment;

  return (
    <Wrapper {...(store && { store })}>
      {entity?.system_profile?.operating_system?.name === 'CentOS Linux' && (
        <ConversionAlert
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        />
      )}
      <div className="ins-c-system-details">
        <Grid hasGutter>
          <GridItem md={6} sm={12}>
            <Grid hasGutter>
              {SystemStatusCardWrapper && (
                <GridItem>
                  <SystemStatusCardWrapper
                    entity={entity}
                    handleClick={handleModalToggle}
                  />
                </GridItem>
              )}
              {SystemCardWrapper && (
                <GridItem>
                  <SystemCardWrapper
                    handleClick={handleModalToggle}
                    writePermissions={writePermissions}
                    entity={entity}
                    fetchEntity={fetchEntity}
                  />
                </GridItem>
              )}
            </Grid>
          </GridItem>
          <GridItem md={6} sm={12}>
            <Grid hasGutter>
              {DataCollectorsCardWrapper && (
                <GridItem>
                  <DataCollectorsCardWrapper
                    entity={entity}
                    handleClick={handleModalToggle}
                  />
                </GridItem>
              )}
              {SubscriptionCardWrapper && (
                <GridItem>
                  <SubscriptionCardWrapper entity={entity} />
                </GridItem>
              )}
            </Grid>
          </GridItem>
          <SystemDetailsModal
            isModalOpen={isModalOpen}
            modalTitle={modalTitle}
            modalVariant={modalVariant}
            modalData={modalData}
            onSort={onSort}
            handleModalToggle={handleModalToggle}
          />
        </Grid>
      </div>
    </Wrapper>
  );
};

Overview.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    system_profile: PropTypes.shape({
      operating_system: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    fqdn: PropTypes.string,
  }),
  store: PropTypes.any,
  writePermissions: PropTypes.bool,
  SystemCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  SystemStatusCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  DataCollectorsCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  SubscriptionCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  navigate: PropTypes.any,
  inventoryId: PropTypes.string.isRequired,
  systemProfilePrefetched: PropTypes.bool,
  fetchEntity: PropTypes.func,
};

const OverviewComponent = (props) => {
  const navigate = useInsightsNavigate();
  return <Overview {...props} navigate={navigate} />;
};

export default OverviewComponent;
