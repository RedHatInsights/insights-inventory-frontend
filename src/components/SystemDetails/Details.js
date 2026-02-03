import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  GridItem,
  Modal,
  ModalHeader,
  ModalBody,
} from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import InfoTable from '../GeneralInfo/InfoTable';
import '../GeneralInfo/system-details.scss';
import { OperatingSystemCard } from '../GeneralInfo/OperatingSystemCard';
import { BiosCard } from '../GeneralInfo/BiosCard';
import { BootcImageCard } from '../GeneralInfo/BootcImageCard';
import { NetworkInterfacesCard } from '../GeneralInfo/NetworkInterfacesCard';
import { ConfigurationCard } from '../GeneralInfo/ConfigurationCard';
import { HardwarePropertiesCard } from '../GeneralInfo/HardwarePropertiesCard';
import { Provider } from 'react-redux';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import useModalState from './hooks/useModalState';
import RhelAICard from '../GeneralInfo/RhelAICard/RhelAICard';

const Details = ({
  store,
  OperatingSystemCardWrapper = OperatingSystemCard,
  RhelAICardWrapper = RhelAICard,
  BiosCardWrapper = BiosCard,
  BootcImageCardWrapper = BootcImageCard,
  NetworkInterfacesCardWrapper = NetworkInterfacesCard,
  HardwarePropertiesCardWrapper = HardwarePropertiesCard,
  ConfigurationCardWrapper = ConfigurationCard,
  CollectionCardWrapper = false,
  navigate,
  entity = {},
  inventoryId,
  fetchEntity,
  systemProfilePrefetched = false,
  isBootcHost = false,
  showRuntimesProcesses = false,
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
      <div className="ins-c-system-details">
        <Grid hasGutter>
          <GridItem md={6} sm={12}>
            <Grid hasGutter>
              {HardwarePropertiesCardWrapper && (
                <GridItem>
                  <HardwarePropertiesCardWrapper
                    entity={entity}
                    handleClick={handleModalToggle}
                  />
                </GridItem>
              )}
              {OperatingSystemCardWrapper && (
                <GridItem>
                  <OperatingSystemCardWrapper
                    entity={entity}
                    handleClick={handleModalToggle}
                  />
                </GridItem>
              )}
              {NetworkInterfacesCardWrapper && (
                <GridItem>
                  <NetworkInterfacesCardWrapper
                    entity={entity}
                    handleClick={handleModalToggle}
                  />
                </GridItem>
              )}
              {isBootcHost && BootcImageCardWrapper && (
                <GridItem>
                  <BootcImageCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
            </Grid>
          </GridItem>
          <GridItem md={6} sm={12}>
            <Grid hasGutter>
              {ConfigurationCardWrapper && (
                <GridItem>
                  <ConfigurationCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
              {RhelAICardWrapper &&
                entity?.system_profile?.workloads?.rhel_ai && (
                  <GridItem>
                    <RhelAICardWrapper
                      rhelAI={entity.system_profile.workloads.rhel_ai}
                      handleClick={handleModalToggle}
                    />
                  </GridItem>
                )}
              {BiosCardWrapper && (
                <GridItem>
                  <BiosCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
              {CollectionCardWrapper && (
                <GridItem>
                  <CollectionCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
              {showRuntimesProcesses && entity.fqdn && (
                <GridItem>
                  <AsyncComponent
                    scope="runtimes"
                    module="./RuntimesProcessesCard"
                    hostname={entity.fqdn}
                  />
                </GridItem>
              )}
            </Grid>
          </GridItem>
          <Modal
            aria-label={`${modalTitle || ''} modal`}
            isOpen={isModalOpen}
            onClose={() => handleModalToggle()}
            className="ins-c-inventory__detail--dialog"
            variant={modalVariant}
          >
            <ModalHeader title={modalTitle || ''} />
            <ModalBody>
              <InfoTable
                cells={modalData.cells}
                rows={modalData.rows}
                expandable={modalData.expandable}
                onSort={onSort}
                filters={modalData.filters}
              />
            </ModalBody>
          </Modal>
        </Grid>
      </div>
    </Wrapper>
  );
};

Details.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fqdn: PropTypes.string,
  }),
  store: PropTypes.any,
  OperatingSystemCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  RhelAICardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  BiosCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
  BootcImageCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  NetworkInterfacesCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  HardwarePropertiesCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  ConfigurationCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  CollectionCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  navigate: PropTypes.any,
  inventoryId: PropTypes.string.isRequired,
  systemProfilePrefetched: PropTypes.bool,
  fetchEntity: PropTypes.func,
  isBootcHost: PropTypes.bool,
  showRuntimesProcesses: PropTypes.bool,
};

const DetailsComponent = (props) => {
  const navigate = useInsightsNavigate();
  return <Details {...props} navigate={navigate} />;
};

export default DetailsComponent;
