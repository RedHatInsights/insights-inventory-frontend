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
import { InfrastructureCard } from '../GeneralInfo/InfrastructureCard';
import { ConfigurationCard } from '../GeneralInfo/ConfigurationCard';
import { Provider } from 'react-redux';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import useModalState from './hooks/useModalState';

const Details = ({
  store,
  OperatingSystemCardWrapper = OperatingSystemCard,
  BiosCardWrapper = BiosCard,
  BootcImageCardWrapper = BootcImageCard,
  InfrastructureCardWrapper = InfrastructureCard,
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
              {InfrastructureCardWrapper && (
                <GridItem>
                  <InfrastructureCardWrapper
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
              {isBootcHost && BootcImageCardWrapper && (
                <GridItem>
                  <BootcImageCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
            </Grid>
          </GridItem>
          <GridItem md={6} sm={12}>
            <Grid hasGutter>
              {BiosCardWrapper && (
                <GridItem>
                  <BiosCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
              {ConfigurationCardWrapper && (
                <GridItem>
                  <ConfigurationCardWrapper handleClick={handleModalToggle} />
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
  BiosCardWrapper: PropTypes.oneOfType([PropTypes.elementType, PropTypes.bool]),
  BootcImageCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  InfrastructureCardWrapper: PropTypes.oneOfType([
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
