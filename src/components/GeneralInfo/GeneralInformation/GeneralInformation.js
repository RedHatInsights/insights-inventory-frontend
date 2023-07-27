import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, GridItem, Modal } from '@patternfly/react-core';
import { SortByDirection } from '@patternfly/react-table';

import { systemProfile } from '../../../store/actions';
import InfoTable from '../InfoTable';
// Since there's a problem with cards loading asynchronously we have to import the cards here as named
import { OperatingSystemCard } from '../OperatingSystemCard';
import { SystemCard } from '../SystemCard';
import { BiosCard } from '../BiosCard';
import { InfrastructureCard } from '../InfrastructureCard';
import { ConfigurationCard } from '../ConfigurationCard';
import { SystemStatusCard } from '../SystemStatusCard';
import { DataCollectorsCard } from '../DataCollectorsCard/DataCollectorsCard';
import { Provider } from 'react-redux';
import './general-information.scss';
import { useLocation, useNavigate } from 'react-router-dom';

const GeneralInformation = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const entity = useSelector(({ entityDetails }) => entityDetails.entity);
  const [modalState, setModalState] = useState({
    isModalOpen: false,
    modalTitle: '',
    modalVariant: 'small',
    cells: [],
    expandable: true,
    filters: undefined,
  });

  const [rows, setRows] = useState([]);

  const onSort = (_event, index, direction, customRows) => {
    const sorted = (customRows || rows).sort((a, b) => {
      const firstRow = a.cells || a;
      const secondRow = b.cells || b;
      const aSortBy = (
        '' + (firstRow[index].sortValue || firstRow[index])
      ).toLocaleLowerCase();
      const bSortBy = (
        '' + (secondRow[index].sortValue || secondRow[index])
      ).toLocaleLowerCase();
      return aSortBy > bSortBy ? -1 : 1;
    });
    setRows(direction === SortByDirection.asc ? sorted : sorted.reverse());
  };

  const handleModalToggle = (
    modalTitle = '',
    { cells, rows, expandable, filters } = {},
    modalVariant = 'small'
  ) => {
    rows && onSort(undefined, expandable ? 1 : 0, SortByDirection.asc, rows);
    if (modalState.isModalOpen) {
      navigate(`../${location.pathname.split('/').slice(0, -1).join('/')}`);
    }

    setModalState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
      modalTitle,
      cells,
      expandable,
      filters,
      modalVariant,
    }));
  };

  useEffect(() => {
    dispatch(systemProfile(props.inventoryId || entity.id));
  }, []);

  const {
    store,
    writePermissions,
    SystemCardWrapper,
    OperatingSystemCardWrapper,
    BiosCardWrapper,
    InfrastructureCardWrapper,
    ConfigurationCardWrapper,
    SystemStatusCardWrapper,
    DataCollectorsCardWrapper,
    CollectionCardWrapper,
    children,
  } = props;
  const Wrapper = store ? Provider : Fragment;

  return (
    <Wrapper {...(store && { store })}>
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
            </Grid>
          </GridItem>
          {children}
          <Modal
            title={modalState.modalTitle || ''}
            aria-label={`${modalState.modalTitle || ''} modal`}
            isOpen={modalState.isModalOpen}
            onClose={() => handleModalToggle()}
            className="ins-c-inventory__detail--dialog"
            variant={modalState.modalVariant}
          >
            <InfoTable
              cells={modalState.cells}
              rows={rows}
              expandable={modalState.expandable}
              onSort={onSort}
              filters={modalState.filters}
            />
          </Modal>
        </Grid>
      </div>
    </Wrapper>
  );
};

GeneralInformation.propTypes = {
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
  children: PropTypes.node,
  location: PropTypes.any,
  inventoryId: PropTypes.string.isRequired,
};
GeneralInformation.defaultProps = {
  entity: {},
  SystemCardWrapper: SystemCard,
  OperatingSystemCardWrapper: OperatingSystemCard,
  BiosCardWrapper: BiosCard,
  InfrastructureCardWrapper: InfrastructureCard,
  ConfigurationCardWrapper: ConfigurationCard,
  SystemStatusCardWrapper: SystemStatusCard,
  DataCollectorsCardWrapper: DataCollectorsCard,
  CollectionCardWrapper: false,
  systemProfilePrefetched: false,
  showImageDetails: false,
};

export default GeneralInformation;
