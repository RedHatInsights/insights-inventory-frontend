import React, { Fragment, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, GridItem, Modal, ModalVariant } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

import { systemProfile } from '../../../store/actions';
import InfoTable from '../InfoTable';
// Since there's a problem with cards loading asynchronously we have to import the cards here as named
import { OperatingSystemCard } from '../OperatingSystemCard';
import { SystemCard } from '../SystemCard';
import { BiosCard } from '../BiosCard';
import { BootcImageCard } from '../BootcImageCard';
import { InfrastructureCard } from '../InfrastructureCard';
import { ConfigurationCard } from '../ConfigurationCard';
import { SystemStatusCard } from '../SystemStatusCard';
import { DataCollectorsCard } from '../DataCollectorsCard/DataCollectorsCard';
import { SubscriptionCard } from '../SubscriptionCard';
import { Provider } from 'react-redux';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';

import './general-information.scss';
import { ConversionAlert } from './ConversionAlert';

import sortBy from 'lodash/sortBy';

const GeneralInformation = ({
  store,
  writePermissions,
  SystemCardWrapper = SystemCard,
  OperatingSystemCardWrapper = OperatingSystemCard,
  BiosCardWrapper = BiosCard,
  BootcImageCardWrapper = BootcImageCard,
  InfrastructureCardWrapper = InfrastructureCard,
  ConfigurationCardWrapper = ConfigurationCard,
  SystemStatusCardWrapper = SystemStatusCard,
  DataCollectorsCardWrapper = DataCollectorsCard,
  CollectionCardWrapper = false,
  SubscriptionCardWrapper = SubscriptionCard,
  children,
  navigate,
  entity,
  inventoryId,
  loadSystemDetail,
  systemProfilePrefetched = false,
  showImageDetails = false,
  isBootcHost = false,
  showRuntimesProcesses = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalVariant, setModalVariant] = useState(ModalVariant.small);
  const [modalData, setModalData] = useState({
    cells: [],
    rows: [],
    expandable: false,
    filters: [],
  });

  //Avoids duplicate profile fetch if consumer app already fetched, while staying backwards compatible
  useEffect(() => {
    if (!systemProfilePrefetched) {
      loadSystemDetail?.(inventoryId || entity.id);
    }
  }, [entity.id, inventoryId, loadSystemDetail, systemProfilePrefetched]);

  const onSort = (_event, index, direction, customRows, secondaryIndex) => {
    const sortAttributes = [
      (row) => {
        const value = row[index]?.sortValue || row[index];
        return String(value).toLocaleLowerCase();
      },
    ];
    if (secondaryIndex !== undefined) {
      sortAttributes.push((row) => {
        const value = row[secondaryIndex]?.sortValue || row[secondaryIndex];
        return value.toLocaleLowerCase();
      });
    }
    const toSort = [...(customRows || modalData.rows)];
    const sorted = sortBy(toSort, sortAttributes);
    setModalData((prevData) => ({
      ...prevData,
      rows: direction === SortByDirection.asc ? sorted : [...sorted].reverse(),
    }));
  };

  const handleModalToggle = (
    modalTitle = '',
    { cells, rows, expandable, filters } = {},
    modalVariant = ModalVariant.small
  ) => {
    if (isModalOpen) {
      navigate(-1);
    }

    setIsModalOpen(!isModalOpen);
    setModalTitle(modalTitle);
    setModalVariant(modalVariant);
    setModalData({
      cells,
      rows,
      expandable,
      filters,
    });
    if (rows) onSort(undefined, expandable ? 1 : 0, SortByDirection.asc, rows);
  };

  const Wrapper = store ? Provider : Fragment;

  return (
    <Wrapper {...(store && { store })}>
      {entity?.system_profile?.operating_system?.name === 'CentOS Linux' && (
        <ConversionAlert
          style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}
        />
      )}
      <div className="ins-c-general-information">
        <Grid hasGutter>
          <GridItem md={6} sm={12}>
            <Grid hasGutter>
              {SystemCardWrapper && (
                <GridItem>
                  <SystemCardWrapper
                    handleClick={handleModalToggle}
                    writePermissions={writePermissions}
                  />
                </GridItem>
              )}
              {InfrastructureCardWrapper && (
                <GridItem>
                  <InfrastructureCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
              {SystemStatusCardWrapper && (
                <GridItem>
                  <SystemStatusCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
              {DataCollectorsCardWrapper && (
                <GridItem>
                  <DataCollectorsCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}
            </Grid>
          </GridItem>
          <GridItem md={6} sm={12}>
            <Grid hasGutter>
              {OperatingSystemCardWrapper && (
                <GridItem>
                  <OperatingSystemCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}

              {BiosCardWrapper && (
                <GridItem>
                  <BiosCardWrapper handleClick={handleModalToggle} />
                </GridItem>
              )}

              {SubscriptionCardWrapper && (
                <GridItem>
                  <SubscriptionCardWrapper />
                </GridItem>
              )}

              {isBootcHost && BootcImageCardWrapper && (
                <GridItem>
                  <BootcImageCardWrapper handleClick={handleModalToggle} />
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

              {showImageDetails && (
                <GridItem>
                  <AsyncComponent
                    scope="edge"
                    module="./ImagesInformationCard"
                    deviceIdProps={inventoryId || entity.id}
                  />
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
          {children}
          <Modal
            title={modalTitle || ''}
            aria-label={`${modalTitle || ''} modal`}
            isOpen={isModalOpen}
            onClose={() => handleModalToggle()}
            className="ins-c-inventory__detail--dialog"
            variant={modalVariant}
          >
            <InfoTable
              cells={modalData.cells}
              rows={modalData.rows}
              expandable={modalData.expandable}
              onSort={onSort}
              filters={modalData.filters}
            />
          </Modal>
        </Grid>
      </div>
    </Wrapper>
  );
};

GeneralInformation.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    system_profile: PropTypes.shape({
      operating_system: PropTypes.shape({
        name: PropTypes.string,
      }),
    }),
    fqdn: PropTypes.string,
  }),
  openedModal: PropTypes.string,
  loadSystemDetail: PropTypes.func,
  store: PropTypes.any,
  writePermissions: PropTypes.bool,
  SystemCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
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
  SystemStatusCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  DataCollectorsCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  CollectionCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  SubscriptionCardWrapper: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.bool,
  ]),
  children: PropTypes.node,
  navigate: PropTypes.any,
  inventoryId: PropTypes.string.isRequired,
  systemProfilePrefetched: PropTypes.bool,
  showImageDetails: PropTypes.bool,
  isBootcHost: PropTypes.bool,
  showRuntimesProcesses: PropTypes.bool,
};
GeneralInformation.defaultProps = {
  entity: {},
  SystemCardWrapper: SystemCard,
  OperatingSystemCardWrapper: OperatingSystemCard,
  BiosCardWrapper: BiosCard,
  BootcImageCardWrapper: BootcImageCard,
  InfrastructureCardWrapper: InfrastructureCard,
  ConfigurationCardWrapper: ConfigurationCard,
  SystemStatusCardWrapper: SystemStatusCard,
  DataCollectorsCardWrapper: DataCollectorsCard,
  CollectionCardWrapper: false,
  SubscriptionCardWrapper: SubscriptionCard,
  systemProfilePrefetched: false,
  showImageDetails: false,
  showRuntimesProcesses: false,
};

const GeneralInformationComponent = (props) => {
  const navigate = useInsightsNavigate();
  const dispatch = useDispatch();
  const entity = useSelector(({ entityDetails }) => entityDetails.entity);
  const loadSystemDetail = (itemId) => dispatch(systemProfile(itemId));
  return (
    <GeneralInformation
      {...props}
      navigate={navigate}
      entity={entity}
      loadSystemDetail={loadSystemDetail}
    />
  );
};

export default GeneralInformationComponent;
