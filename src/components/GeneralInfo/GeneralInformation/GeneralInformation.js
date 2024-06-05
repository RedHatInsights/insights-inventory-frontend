import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, GridItem, Modal } from '@patternfly/react-core';
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

class GeneralInformation extends Component {
  state = {
    isModalOpen: false,
    modalTitle: '',
    modalVariant: 'small',
  };

  onSort = (_event, index, direction, customRows) => {
    const { rows } = this.state;
    const sorted = (customRows || rows).sort((a, b) => {
      const firstRow = a.cells || a;
      const secondRow = b.cells || b;
      const aSortBy = (
        '' + (firstRow[index].sortValue || firstRow[index])
      ).toLocaleLowerCase();
      const bSortBy = (
        '' + (secondRow[index].sortValue || secondRow[index])
      ).toLocaleLowerCase();
      return aSortBy < bSortBy ? -1 : 1;
    });
    this.setState({
      rows: direction === SortByDirection.asc ? sorted : sorted.reverse(),
    });
  };

  handleModalToggle = (
    modalTitle = '',
    { cells, rows, expandable, filters } = {},
    modalVariant = 'small'
  ) => {
    rows &&
      this.onSort(undefined, expandable ? 1 : 0, SortByDirection.asc, rows);
    if (this.state.isModalOpen) {
      this.props.navigate(-1);
    }

    this.setState(({ isModalOpen }) => ({
      isModalOpen: !isModalOpen,
      modalTitle,
      cells,
      expandable,
      filters,
      modalVariant,
    }));
  };

  componentDidMount() {
    //Avoids duplicate profile fetch if consumer app already fetched, while staying backwards compatible
    if (!this.props.systemProfilePrefetched) {
      this.props.loadSystemDetail?.(
        this.props.inventoryId || this.props.entity.id
      );
    }
  }

  render() {
    const {
      isModalOpen,
      modalTitle,
      cells,
      rows,
      expandable,
      filters,
      modalVariant,
    } = this.state;
    const {
      store,
      writePermissions,
      SystemCardWrapper,
      OperatingSystemCardWrapper,
      BiosCardWrapper,
      BootcImageCardWrapper,
      InfrastructureCardWrapper,
      ConfigurationCardWrapper,
      SystemStatusCardWrapper,
      DataCollectorsCardWrapper,
      CollectionCardWrapper,
      SubscriptionCardWrapper,
      children,
      entity,
    } = this.props;
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
                      handleClick={this.handleModalToggle}
                      writePermissions={writePermissions}
                    />
                  </GridItem>
                )}
                {InfrastructureCardWrapper && (
                  <GridItem>
                    <InfrastructureCardWrapper
                      handleClick={this.handleModalToggle}
                    />
                  </GridItem>
                )}
                {SystemStatusCardWrapper && (
                  <GridItem>
                    <SystemStatusCardWrapper
                      handleClick={this.handleModalToggle}
                    />
                  </GridItem>
                )}
                {DataCollectorsCardWrapper && (
                  <GridItem>
                    <DataCollectorsCardWrapper
                      handleClick={this.handleModalToggle}
                    />
                  </GridItem>
                )}
              </Grid>
            </GridItem>
            <GridItem md={6} sm={12}>
              <Grid hasGutter>
                {OperatingSystemCardWrapper && (
                  <GridItem>
                    <OperatingSystemCardWrapper
                      handleClick={this.handleModalToggle}
                    />
                  </GridItem>
                )}

                {BiosCardWrapper && (
                  <GridItem>
                    <BiosCardWrapper handleClick={this.handleModalToggle} />
                  </GridItem>
                )}

                {SubscriptionCardWrapper && (
                  <GridItem>
                    <SubscriptionCardWrapper />
                  </GridItem>
                )}

                {this.props.isBootcHost && BootcImageCardWrapper && (
                  <GridItem>
                    <BootcImageCardWrapper
                      handleClick={this.handleModalToggle}
                    />
                  </GridItem>
                )}

                {ConfigurationCardWrapper && (
                  <GridItem>
                    <ConfigurationCardWrapper
                      handleClick={this.handleModalToggle}
                    />
                  </GridItem>
                )}
                {CollectionCardWrapper && (
                  <GridItem>
                    <CollectionCardWrapper
                      handleClick={this.handleModalToggle}
                    />
                  </GridItem>
                )}

                {this.props.showImageDetails && (
                  <GridItem>
                    <AsyncComponent
                      appName="edge"
                      module="./ImagesInformationCard"
                      deviceIdProps={this.props.inventoryId || entity.id}
                    />
                  </GridItem>
                )}

                {this.props.showRuntimesProcesses && entity.fqdn && (
                  <GridItem>
                    <AsyncComponent
                      appName="runtimes"
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
              onClose={() => this.handleModalToggle()}
              className="ins-c-inventory__detail--dialog"
              variant={modalVariant}
            >
              <InfoTable
                cells={cells}
                rows={rows}
                expandable={expandable}
                onSort={this.onSort}
                filters={filters}
              />
            </Modal>
          </Grid>
        </div>
      </Wrapper>
    );
  }
}

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
