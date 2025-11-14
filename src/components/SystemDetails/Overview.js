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
import { systemProfile } from '../../store/actions';
import InfoTable from '../GeneralInfo/InfoTable';
import '../GeneralInfo/system-details.scss';
import { SystemStatusCard } from '../GeneralInfo/SystemStatusCard';
import SystemCard from '../GeneralInfo/SystemCard';
import { DataCollectorsCard } from '../GeneralInfo/DataCollectorsCard/DataCollectorsCard';
import { SubscriptionCard } from '../GeneralInfo/SubscriptionCard';
import { ConversionAlert } from '../GeneralInfo/ConversionAlert';
import { Provider } from 'react-redux';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import sortBy from 'lodash/sortBy';

const Overview = ({
  store,
  writePermissions,
  SystemCardWrapper = SystemCard,
  SystemStatusCardWrapper = SystemStatusCard,
  DataCollectorsCardWrapper = DataCollectorsCard,
  SubscriptionCardWrapper = SubscriptionCard,
  navigate,
  entity,
  inventoryId,
  loadSystemDetail,
  systemProfilePrefetched = false,
  fetchEntity,
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
      {entity?.system_profile?.operating_system?.name === 'CentOS Linux' && (
        <ConversionAlert
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        />
      )}
      <div className="ins-c-system-overview">
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
  loadSystemDetail: PropTypes.func,
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

Overview.defaultProps = {
  entity: {},
  SystemCardWrapper: SystemCard,
  SystemStatusCardWrapper: SystemStatusCard,
  DataCollectorsCardWrapper: DataCollectorsCard,
  SubscriptionCardWrapper: SubscriptionCard,
  systemProfilePrefetched: false,
};

const OverviewComponent = (props) => {
  const navigate = useInsightsNavigate();
  const dispatch = useDispatch();
  const loadSystemDetail = (itemId) => dispatch(systemProfile(itemId));
  return (
    <Overview
      {...props}
      navigate={navigate}
      loadSystemDetail={loadSystemDetail}
    />
  );
};

export default OverviewComponent;
