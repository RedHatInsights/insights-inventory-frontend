import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Grid,
  GridItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalVariant,
} from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { systemProfile } from '../../store/actions';
import InfoTable from '../GeneralInfo/InfoTable';
import '../GeneralInfo/system-details.scss';
import { OperatingSystemCard } from '../GeneralInfo/OperatingSystemCard';
import { BiosCard } from '../GeneralInfo/BiosCard';
import { BootcImageCard } from '../GeneralInfo/BootcImageCard';
import { InfrastructureCard } from '../GeneralInfo/InfrastructureCard';
import { ConfigurationCard } from '../GeneralInfo/ConfigurationCard';
import { Provider } from 'react-redux';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import sortBy from 'lodash/sortBy';

const Details = ({
  store,
  OperatingSystemCardWrapper = OperatingSystemCard,
  BiosCardWrapper = BiosCard,
  BootcImageCardWrapper = BootcImageCard,
  InfrastructureCardWrapper = InfrastructureCard,
  ConfigurationCardWrapper = ConfigurationCard,
  CollectionCardWrapper = false,
  navigate,
  entity,
  inventoryId,
  loadSystemDetail,
  systemProfilePrefetched = false,
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

  useEffect(() => {
    if (entity?.id && !systemProfilePrefetched) {
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
    modalVariant = ModalVariant.small,
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
  loadSystemDetail: PropTypes.func,
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
  isBootcHost: PropTypes.bool,
  showRuntimesProcesses: PropTypes.bool,
};

Details.defaultProps = {
  entity: {},
  OperatingSystemCardWrapper: OperatingSystemCard,
  BiosCardWrapper: BiosCard,
  BootcImageCardWrapper: BootcImageCard,
  InfrastructureCardWrapper: InfrastructureCard,
  ConfigurationCardWrapper: ConfigurationCard,
  CollectionCardWrapper: false,
  systemProfilePrefetched: false,
  showRuntimesProcesses: false,
};

const DetailsComponent = (props) => {
  const navigate = useInsightsNavigate();
  const dispatch = useDispatch();
  const loadSystemDetail = (itemId) => dispatch(systemProfile(itemId));
  return (
    <Details
      {...props}
      navigate={navigate}
      loadSystemDetail={loadSystemDetail}
    />
  );
};

export default DetailsComponent;
